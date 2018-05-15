---
layout: post
title: "Automate your deployment with Capistrano, git and RVM"
date: 2017-01-20 10:55:40 +0200
categories: Technical
tags: [ruby-on-rails, devops]
excerpt: This articles describes how to setup Capistrano in order to automate a Ruby on Rails application.
image: /images/CapistranoLogo.png
ref: capistrano-deploy
---

This articles describes how to setup Capistrano in order to automate a Ruby on Rails 4.2.3 application versioned with git on a server running RVM.
That way, the Rails project is developed on one or more local machines, versioned in git and deployed in an automated fashion on the remote staging / production servers without the need to connect to the servers.

Before getting started, update RVM, ruby and Rails on your local machine:

```bash
rvm get stable
rvm install ruby --latest
gem install rails
```

At the time of writing this article, latest Ruby version is 2.2.1 and latest Rails version is 4.2.3.

Create the local project
------------------------

Create a new Rails project on your local machine or clone an existing project from a remote repository:

```bash
rails new myapp
```

Create the `.ruby-version` and `.ruby-gemset` files at your project's root.
Those files indicate which ruby version and which gemset your are using:

```bash
ruby-2.2.1
myproject
```

Create the git repository locally and on the remote server
----------------------------------------------------------

Create the repository on the remote server:

```bash
mkdir myproject
cd myproject
git --bare init
```

Do the same on your local machine:

```bash
cd myproject
git add -A
git commit "Initial commit"
git remote add origin
git@example.com:/opt/git/repository.git
```

Setup Capistrano
----------------

Capistrano is installed on your local machine using Bundler.
Add the following gems inside your Gemfile:

```ruby
group :development do
  gem 'capistrano-rails'
  gem 'rvm1-capistrano3', require: false
  gem 'capistrano-bundler'
  gem 'capistrano-passenger', '0.0.2'
end
```

Install the gems with:

```bash
bundle install
```

In order to configure Capistrano, run the cap install command that will generate the `config/deploy.rb` and `config/deploy/production.rb` Capistrano configuration files.
Those files will be generated with default configuration values.
Browse those files and make the appropriate adjustments.
For example, set the correct url corresponding to the git repository used to version your application.
As an example, I share the content of those files as I use them in my projects:

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

Before you can deploy your application, don't forget to create the folder that will hold your files as well as the database defined in the `config/database.yml` file on the remote server.


You can now deploy your application with a single command:

```bash
bundle exec cap production deploy
```

Your only remaining task is to configure your web sever (Apache, Nginx) in order to serve your application.