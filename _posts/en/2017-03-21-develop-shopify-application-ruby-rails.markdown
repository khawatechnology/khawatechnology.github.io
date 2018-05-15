---
layout: post
title: "Develop a Shopify application with Ruby on Rails"
date: 2017-03-21 10:55:40 +0200
categories: Technical
tags: [ruby-on-rails, shopify]
excerpt: In this article, we'll see through a simple example how to develop a Shopify application using Ruby on Rails.
image: /images/shopify_logo_black_1.png
ref: shopify-app-rails
---

In this article, we'll see through a simple example how to develop a Shopify application using Ruby on Rails.
Our application will retrieve and display the list of orders passed on a shop
You'll notice that the architecture of a Shopify application is very different from that of a Magento or Prestashop module.
The code of a Magento module is directly added to the Magento source code and the module has direct access to the Magento database.
A Shopify application on the other hand is hosted on its own server and accesses Shopify data via its API.
Hence, the very first step is to configure our Rails application to be able to communicate with the Shopify API.

Create a Shopify partner account
--------------------------------

In order to be able to ask for a Shopify API key, you'll need a Shpoify Partner account.
Browse to [http://shopify.com/partners](http://shopify.com/partners) and create your account.
You'll then be able to create a new application in order to get an API key and its corresponding secret.

Application configuration
-------------------------
We'll be using the very useful [`shopify_app`](https://github.com/Shopify/shopify_app) gem that provides the `SessionsController` class as well as code that allows to authentify our application with the Shopify API via Oauth.
Add the gem to your `Gemfile` and install your project.

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

We now need to configure the Rails application so that it can communicates with the Shopify API.
I recommend you take advantage of the generator provided by the `shopify_app` gem.
The generator will create various files necessary for your application to work properly with Shopify.

```bash
rails generate shopify_app --api_key <your_api_key> --secret <your_app_secret>
```

Among the files created by the generator, we have:

### An initialization file

The `config/initializer/shopify_app.rb` file contains the configuration allowing your application to authenticate with the Shopify API:

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

In this example, the application requests a read access to the orders of the shop on which the application is installed.
We also indicate that the application will be integrated inside the Shopify backend.
This means our application will be displayed within an iframe integrated inside the Shopify backend, giving the impression that it is part of Shopify.
Finally, the application requests to be notified when certain events regarding orders occur or when the application is deleted from a shop.

### The routes configuration file

The `config/routes.rb` file has been updated in order to include the `ShopifyApp` engine routes inside our application:

```ruby
Rails.application.routes.draw do
  mount ShopifyApp::Engine, at: '/'

  root :to => 'orders#index'
end
```

Besides the routes provided by the engine used during the authentication process with the Shopify API, we add a route to the action that will list existing orders from the shop.

### The Shop model

The gem generator creates the `Shop` model as well as the associated migration.
The shops on which the application is installed are stored in the `shops` table. yor each shop it is installed on, the table also stores the authentication token.

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

Don't forget to run your migrations after generating the migration file.

Now that we have turned the Rails application into a Shopify application with the `shopify_app` gem, let's see how we can retrieve the orders list and display it in our application.

The controller
--------------

The `OrdersController` controller is responsible for retrieving the orders.
It inherits the `ShopifyApp::AuthenticatedController` controller provided by the `shopify_app` gem.

The `get_current_shop` method retrieves the shop the application is currently running on.
The `synchronize` method that we'll study later on retrieves the orders via the Shopify API and stores them in our Rails application's database.

The models
----------

Besides the `Shop` model necessary to any Shopify application, we'll create the `Order` model that represents an order:

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

Finally, let's look at the `Shop`'s model synchronize method that retrieves the orders via the Shopify API and stores them in the database:

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

The views
---------

We'll now create the views that will list the orders.

First, let's have a look at this example layout that takes advantage of the [Embedded App SDK](https://help.shopify.com/api/sdks/shopify-apps/embedded-app-sdk) that allows to integrate your Rails application directly inside the Shopify administration interface:

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

The Embedded App SDK allows, among other things, to add buttons, display alerts and modals directly inside the Shopify interface.
That is why it needs to authenticate using the Shopify API key.

Below is the view that lists the orders retrieved by the controller:

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

Notice that the view adds pagination button using the Embedded App SDK.

Example job
-----------

Below is an example job that gets called by the Shopify API when an order is created on a shop, as we asked in the `webhooks` instruction in the `shopify_app.rb` initialization file.
The webhook system allows to keep our Rails application orders in synchronization with the orders in the shops the application is installed on.
For example, we asked that our application be informed via a webhook whenever a new order is created so that it can create the order in its own database.
Let's look at the `OrdersCreateJob` class:

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

Last recommendation
-------------------

I highly recommend that you style your Shopify application using the [Shopify Embedded App Frontend Framework](http://seaff.microapps.com/) frontend library.
This library provides CSS and Javascript code allowing you to use the Shopify user interface elements.
Your users will be greatly appreciate it as they are already used to this interface.

Conclusion
----------

The example application presented in this article is very limited and doesn't add any value to what you can do in the Shopify administration interface.
However, you now know everything you need to create an awesome Shopify application with Ruby on Rails.