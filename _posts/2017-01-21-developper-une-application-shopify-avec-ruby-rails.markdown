---
layout: post
title: "Développer une application Shopify avec Ruby on Rails"
date: 2017-03-21 10:55:40 +0200
categories: Technical
tags: [ruby-on-rails, shopify]
excerpt: Cet article décrit comment développer une application Shopify avec Ruby on Rails au travers d'un exemple simple.
image: /images/shopify_logo_black_1.png
lang: fr
ref: shopify-app-rails
---

Dans cet article, nous allons voir au travers d'un exemple simple comment développer une application Shopify avec Ruby on Rails
Notre application récupère et affiche la liste des commandes passées sur une boutique.
Vous remarquerez que l'architecture d'une application Shopify est très différente de cette d'un module Magento ou Prestashop par exemple.
Le code source du module Magento est directement intégré au code Magento et le module a un accès complet à la base de données de la boutique.
Une application Shopify est hébergée sur un serveur isolé de la boutique, n'a accès qu'à sa propre base de données et communique avec la boutique via l'API Shopify.
Ainsi, la première étape est de configurer l'application Ruby on Rails afin qu'elle soit capable de communiquer avec l'API Shopify.

Créez un compte Shopify Parner
--------------------------------

Afin d'être en mesure de faire votre demande de clé d'API Shopify, vous devez disposer d'un compte Shopify Partner.
Rendez-vous à l'adresse [http://shopify.com/partners](http://shopify.com/partners) pour créer votre compte.
Créez ensuite une nouvelle application afin d'obtenir une clé d'API et le secret correspondant.

Configuration de l'application
-------------------------
Nous allons nous servir de la très pratique gem [`shopify_app`](https://github.com/Shopify/shopify_app) qui nous fournit la classe `SessionsController` ainsi que du code permettant d'authentifier notre application à l'API Shopify via Oauth.
Ajoutez la gem à votre `Gemfile` et installez votre projet.

```ruby
ruby '2.3.3'
source 'https://rubygems.org'


# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.2.6'
# Use posgresql as the database for Active Record
gem 'pg'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'

# Use jquery as the JavaScript library
gem 'jquery-rails'
# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
gem 'turbolinks'
# bundle exec rake doc:rails generates the API under doc/api.
gem 'sdoc', '~> 0.4.0', group: :doc

# Handles Shopify API authentication and API requests
gem 'shopify_app', '~> 7.0.0'

# Pagination library for Rails
gem 'will_paginate', '~> 3.1.0'

# I had this gem in a previous version but cant remember why..
# Remove if everything is working fine
# gem 'sinatra'

#  Simple, efficient background processing for Ruby
gem 'sidekiq'
```

Il faut maintenant configurer l'application Rails afin soit capable de communiquer correctement avec l'API Shopify.
Je vous recommande d'utiliser le générateur fourni par la gem `shopify_app` qui va créer pour vous différents fichiers nécessaires au bon fonctionnement de votre application.

```bash
rails generate shopify_app --api_key <your_api_key> --secret <your_app_secret>
```

Parmi les fichiers crées par le générateur, nous avons :

### Un fichier d'initialisation

Le fichier `config/initializer/shopify_app.rb` contient la configuration permettant à votre application de s'authentifier à l'API Shopify :

```ruby
ShopifyApp.configure do |config|
  config.api_key = ENV['SHOPIFY_EXPEDITOR_INET_API_KEY']
  config.secret = ENV['SHOPIFY_EXPEDITOR_INET_API_SECRET']
  config.scope = "read_orders"
  config.embedded_app = true
  config.webhooks = [
    {topic: 'app/uninstalled', address: "#{ENV['WEBHOOK_URL']}app_uninstalled", format: 'json'},
    {topic: 'orders/delete', address: "#{ENV['WEBHOOK_URL']}orders_delete", format: 'json'},
    {topic: 'orders/create', address: "#{ENV['WEBHOOK_URL']}orders_create", format: 'json'},
    {topic: 'orders/updated', address: "#{ENV['WEBHOOK_URL']}orders_updated", format: 'json'}
  ]
end
```

Dans cette exemple, l'application requiert un accès en lecture aux commandes des boutiques Shopify sur lesquelles l'application est installée.
Nous indiquons que l'application sera intégrée à l'administration Shopify, c'est à dire qu'elle sera servie dans une iframe à l'intérieur d'une page d'administration Shopify, donnant ainsi l'illusion d'être partie intégrante de Shopify.
Finalement, l'application demande à être avertie lors de certains événements concernant les commandes ou lorsque l'application est désinstallée d'une boutique.

### Un fichier de configuration des routes

Le fichier `config/routes.rb` a été mis à jour afin d'inclure les routes de l'engine `ShopifyApp` :

```ruby
Rails.application.routes.draw do
  mount ShopifyApp::Engine, at: '/'

  root :to => 'orders#index'
end
```

En plus des routes fournies par l'engine utilisées lors du processus d'authentification de votre application avec l'API Shopify, nous ajoutons la route vers l'action qui liste les commandes existantes dans la boutique.

### Le modèle Shop

Le générateur crée le modèle `Shop` ainsi que la migration associée.
C'est dans la table `shops` que seront enregistrées les boutiques sur lesquelles l'application a été installée.
Pour chaque boutique, la table enregistre aussi le token permettant de s'authentifier à la boutique.

```ruby
class CreateShops < ActiveRecord::Migration
  def self.up
    create_table :shops  do |t|
      t.string :shopify_domain, null: false
      t.string :shopify_token, null: false
      t.timestamps
    end

    add_index :shops, :shopify_domain, unique: true
  end

  def self.down
    drop_table :shops
  end
end
```

```ruby
class Shop < ActiveRecord::Base
  include ShopifyApp::Shop
  include ShopifyApp::SessionStorage
end
```

Pensez à jouer vos migrations après avoir généré le modèle et le fichier de migration.

Maintenant que vous avons transformé notre application Rails en application Shopify à l'aide de la gem `shopify_app` et de son générateur, voyons comment nous pouvons récupérer la liste des commandes et les afficher dans notre application.

Création du contrôleur
--------------

Le contrôleur `OrdersController` est en charge de récupérer la liste des commandes. Il hérite du contrôleur `ShopifyApp::AuthenticatedController` fourni par la gem `shopify_app`.

La méthode `get_current_shop` récupère la boutique sur laquelle l'application est en train d'être utilisée.
La méthode `synchronize` que nous allons voir plus loin récupère la liste des commandes via l'API Shopify et les enregistre dans la base de donnée locale à l'application Rails.

Création des modèles
---

En plus du modèle `Shop` nécessaire à toute application Shopify, nous devons créer le modèle `Order` qui représente une commande :

```ruby
class CreateOrders < ActiveRecord::Migration
  def change
    create_table :orders do |t|
      t.string :shopify_order_id, null: false
      t.string :shopify_order_name, default: ''
      t.datetime :shopify_order_created_at
      t.belongs_to :shop, index: true
      t.timestamps
    end

    add_index :orders, :shopify_order_id, unique: true
  end
end
```

```ruby
class Order < ActiveRecord::Base
  belongs_to :shop
end
```

Finalement, voyons la méthode `synchronize` du modèle `Shop` qui récupère les commandes via l'API Shopify afin de les enregistrer en base de données :

```ruby
class Shop < ActiveRecord::Base
  include ShopifyApp::Shop
  include ShopifyApp::SessionStorage

  has_many :orders, dependent: :destroy

  def synchronize
    self.orders.delete_all
    orders = ShopifyAPI::Order.find(:all, params: {status: :any})
    orders.each do |order|
      order = Order.create(
          {
              shopify_order_id: order.id,
              shopify_order_name: order.name,
              shopify_order_created_at: order.created_at,
          })
      self.orders << order
    end
    self.orders_synchronized = true
    self.save
  end

  def orders_synchronized?
    return self.orders_synchronized
  end
end
```

Création des vues
---------

Nous allons maintenant créer les vues permettant d'afficher la liste des commandes.

Voyons tout d'abord un exemple de layout tirant parti de l'[Embedded App SDK](https://help.shopify.com/api/sdks/shopify-apps/embedded-app-sdk) permettant d'intégrer votre application Rails directement à l'intérieur de l'interface d'administration Shopify :

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Shopify Embedded Example App</title>
    <%= stylesheet_link_tag 'application' %>
    <%= csrf_meta_tags %>
  </head>

  <body>
    <div class="app-wrapper">
      <div class="app-content">
        <main role="main">
          <%= yield %>
        </main>
      </div>
    </div>

    <%= render 'layouts/flash_messages' %>

    <script src="https://cdn.shopify.com/s/assets/external/app.js?<%= Time.now.strftime('%Y%m%d%H') %>"></script>

    <script type="text/javascript">
      ShopifyApp.init({
        apiKey: "<%= ShopifyApp.configuration.api_key %>",
        shopOrigin: "<%= "https://#{ @shop_session.url }" if @shop_session %>",
        debug: <%= Rails.env.development? ? 'true' : 'false' %>,
        forceRedirect: true
      });
    </script>

    <%= javascript_include_tag 'application', "data-turbolinks-track" => true %>

    <% if content_for?(:javascript) %>
      <div id="ContentForJavascript" data-turbolinks-temporary>
        <%= yield :javascript %>
      </div>
    <% end %>
  </body>
</html>
```

L'Embedded App SDK permet entre autres choses d'ajouter des boutons ou d'afficher des alertes et des modals directement dans l'interface de Shopify.
C'est pourquoi le SDK a besoin de s'authentifier à l'aide de la clé d'API Shopify.

Voyons maintenant la vue listant les commandes récupérées par le contrôleur :

```html
<% content_for :javascript do %>
  <script type="text/javascript">
    ShopifyApp.ready(function(){
      ShopifyApp.Bar.initialize({
        icon: "<%= asset_path('favicon.ico') %>",
        pagination: {
          previous: <%= (@previous_page.present? ? {href: @previous_page} : nil).to_json.html_safe %>,
          next: <%= (@next_page.present? ? {href: @next_page} : nil).to_json.html_safe %>
        }
      });
    });
  </script>
<% end %>

<div class="section">
  <div class="section-content">
    <div class="section-row">
      <div class="section-listing">
        <div class="section-options">
          <ul class="section-tabs">
            <li class="active"><a href="#top">All Orders</a></li>
          </ul>
          <div class="section-content">
            <div class="section-row">
              <% if @orders.any? %>
                <table class="table-section">
                  <thead>
                  <tr>
                    <th class="select-col">
                      <div class="btn default btn-select-all ico-down">
                        <input id="select-all" class="checkbox" type="checkbox" value="" name="select-all">
                        <span class="checkbox-styled"></span>
                      </div>
                    </th>
                    <th class="sortable">Order</th>
                    <th class="sortable">Date</th>
                  </tr>
                  </thead>
                  <tbody>
                    <% @orders.each do |order| %>
                        <tr>
                          <td>
                            <input class="checkbox select-order-checkbox" type="checkbox" value="<%= order.id %>">
                            <span class="checkbox-styled"></span>
                          </td>
                          <td><%= link_to order.shopify_order_name, "https://#{@shop_session.url}/admin/orders/#{order.shopify_order_id}", target: "_top" %></td>
                          <td><%= format_date order.shopify_order_created_at %></td>
                        </tr>
                    <% end %>
                  </tbody>
                </table>
              <% else %>
                  <div>There is no order.</div>
              <% end %>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

Remarquez que la vue ajoute des boutons de pagination via le Embedded App SDK.

Création d'un job
---

Voyons un exemple de job appelé par l'API Shopify lors d'un événement sur une commande comme demandé via l'instruction `webhooks` dans le fichier d'initialisation `shopify_app.rb`.
Le système de webhooks permet de garder les commandes de notre application Rails synchronisées avec les commandes de la boutique Shopify.
Par exemple, notre application demande à être informée lors de la création d'une nouvelle commande afin qu'elle puisse elle-même créer cette commande dans sa base de données.
Etudions donc la classe `OrdersCreateJob` :

```ruby
class OrdersCreateJob < ActiveJob::Base
  def perform(shop_domain:, webhook:)
    shop = Shop.find_by(shopify_domain: shop_domain)

    shop.with_shopify_session do

      order =
          {
              shopify_order_id: webhook[:id],
              shopify_order_name: webhook[:order_number],
              shopify_order_created_at: webhook[:created_at]
          }
      order = Order.where(shopify_order_id: order[:shopify_order_id]).first_or_create(order)
      shop.orders << order
    end
  end
end
```

Dernière recommandation
---

Je vous recommande vivement de styler votre application Shopify à l'aide de la librairie frontend [Shopify Embedded App Frontend Framework](http://seaff.microapps.com/).
Cette librairie fournit le code CSS et Javascript vous permettant de reproduire l'interface utilisateur Shopify, vous faciliterez ainsi grandement la vie de vos utilisateurs qui sont déjà habitués à utiliser cette interface.

Conclusion
----------

L'exemple présenté dans cet article est bien entendu très limité et n'apporte aucune valeur ajoutée par rapport à ce que propose déjà l'interface d'administration Shopify.
Cependant, vous disposez maintenant de tous les outils vous permettant de créer une application Shopify aussi évoluée que vous le désirez avec Ruby on Rails.
