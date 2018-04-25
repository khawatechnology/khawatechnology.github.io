---
layout: post
title: "Déploiement automatisé avec Capistrano, git et RVM"
date: 2017-01-20 10:55:40 +0200
categories: Technical
tags: [ruby-on-rails, devops]
excerpt: Cet article décrit la procédure de mise en place de Capistrano afin d'automatiser le déploiement d'une application Ruby on Rails.
image: /images/CapistranoLogo.png
lang: fr
ref: capistrano-deploy
---

Cet article décrit la procédure de mise en place de Capistrano afin d'automatiser le déploiement d'une application Ruby on Rails 4.2.3 versionnée avec git sur un serveur utilisant RVM.
Ainsi le projet Rails est développé en local sur une ou plusieurs machine, est versionné avec git et est déployé de manière automatisée sur le serveur de test / production sans avoir besoin de se connecter au serveur.

Avant de commencer, mettez à jour RVM, ruby ainsi que Rails sur votre machine locale :

```bash
rvm get stable
rvm install ruby --latest
gem install rails
```

A l'heure où j'écris cet article, il s'agit de ruby-2.2.1 et Rails 4.2.3

Création du projet en local
------------------------

Créez un nouveau projet sur votre machine locale ou alternativement clonez un projet existant depuis github :

```bash
rails new myapp
```

Créez les fichiers `.ruby-version` et `.ruby-gemset` à la racine du projet Rails qui indiquent à RVM avec quelle version de ruby et avec quel gemset vous travaillez :

```bash
ruby-2.2.1
myproject
```

Création des repository git en local et sur le serveur
----------------------------------------------------------

Créez le repository sur le serveur :

```bash
mkdir myproject
cd myproject
git --bare init
```

Faites de même sur votre machine locale :

```bash
cd myproject
git add -A
git commit "Initial commit"
git remote add origin
git@example.com:/opt/git/repository.git
```

Mise en place de Capistrano
---------------------------

Capistrano s'installe sur votre machine locale à l'aide de bundler.
Ajoutez les gems suivantes dans votre Gemfile :

```ruby
group :development do
  gem 'capistrano-rails'
  gem 'rvm1-capistrano3', require: false
  gem 'capistrano-bundler'
  gem 'capistrano-passenger', '0.0.2'
end
```

Installez les gems :

```bash
bundle install
```

Afin de configurer Capistrano, exécutez la commande cap install qui va générer les fichiers de configuration Capistrano `config/deploy.rb` et `config/deploy/production.rb`.
Ceux-ci contiennent les valeurs de configuration de base.
Parcourez ces fichiers et faites les modifications nécessaires, par exemple renseignez l'url du repository git utilisé pour versionner votre application.
A titre d'exemple, je partage le contenu de ces fichiers tel qu'utilisés dans un de mes projets :

```ruby
# config valid only for current version of Capistrano
lock '3.4.0'

set :application, 'redmine'
set :repo_url, 'git@example.com:khawa/myproject.git'

# Default branch is :master
# ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

# Default deploy_to directory is /var/www/myproject
# set :deploy_to, '/var/www/myproject'

# Default value for :scm is :git
set :scm, :git

# Default value for :format is :pretty
# set :format, :pretty

# Default value for :log_level is :debug
# set :log_level, :debug

# Default value for :pty is false
set :pty, true

# Default value for :linked_files is []
set :linked_files, fetch(:linked_files, []).push('config/database.yml', 'config/configuration.yml')

# Default value for linked_dirs is []
set :linked_dirs, fetch(:linked_dirs, []).push('log', 'tmp/pids', 'tmp/cache', 'tmp/sockets', 'vendor/bundle', 'public/system')

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
# set :keep_releases, 5

namespace :deploy do

  after :restart, :clear_cache do
    on roles(:web), in: :groups, limit: 3, wait: 10 do
      # Here we can do anything such as:
      # within release_path do
      #   execute :rake, 'cache:clear'
      # end
    end
  end

end

# server-based syntax
# ======================
# Defines a single server with a list of roles and multiple properties.
# You can define all roles on a single server, or split them:

server 'example.com', user: 'deploy', roles: %w{app db web}
# server 'example.com', user: 'deploy', roles: %w{app web}, other_property: :other_value
# server 'db.example.com', user: 'deploy', roles: %w{db}


# role-based syntax
# ==================

# Defines a role with one or multiple servers. The primary server in each
# group is considered to be the first unless any  hosts have the primary
# property set. Specify the username and a domain or IP for the server.
# Don't use `:all`, it's a meta role.

role :app, %w{deploy@example.com}
role :web, %w{deploy@example.com}
role :db,  %w{deploy@example.com}

set :stage, :production
set :branch, 'production'
set :full_app_name, "#{fetch(:application)}_#{fetch(:stage)}"
set :deploy_to, "/var/www/#{fetch(:myproject)}"
set :rails_env, :production


# Configuration
# =============
# You can set any configuration variable like in config/deploy.rb
# These variables are then only loaded and set in this stage.
# For available Capistrano configuration variables see the documentation page.
# http://capistranorb.com/documentation/getting-started/configuration/
# Feel free to add new variables to customise your setup.


# Custom SSH Options
# ==================
# You may pass any option but keep in mind that net/ssh understands a
# limited set of options, consult the Net::SSH documentation.
# http://net-ssh.github.io/net-ssh/classes/Net/SSH.html#method-c-start
#
# Global options
# --------------
set :ssh_options, {
 keys: %w(/home/git/.ssh/id_rsa),
 forward_agent: false,
 # auth_methods: %w(password)
}
#
# The server-based syntax can be used to override options:
# ------------------------------------
# server 'example.com',
#   user: 'user_name',
#   roles: %w{web app},
#   ssh_options: {
#     user: 'user_name', # overrides user setting above
#     keys: %w(/home/user_name/.ssh/id_rsa),
#     forward_agent: false,
#     auth_methods: %w(publickey password)
#     # password: 'please use keys'
#   }
```

Avant de pouvoir déployer votre application, pensez à créer le répertoire qui contiendra les fichiers ainsi que sa base de données telle que définie dans le fichier `config/database.yml` sur le serveur de production.

Vous pouvez alors déployer l'application à l'aide de la commande :

```bash
bundle exec cap production deploy
```

Il ne vous reste plus qu'a configurer votre serveur web (Apache, Nginx) afin de servir l'application.
