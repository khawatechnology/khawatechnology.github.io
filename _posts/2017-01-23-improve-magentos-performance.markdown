---
layout: post
title: "Improve  Magento's performances"
date: 2017-01-23 10:55:40 +0200
categories: Technical
tags: [magento, performance]
excerpt: This article describes how to improve Magento's performances by optimizing the core_url_rewrite table.
image: /images/database-schema.png
lang: en
ref: magento-performance
---

Magento saves every url redirections to category and product pages in the `core_url_rewrite` table.
In some cases, this table can grow increasingly huge, especially if your shop contains more than 10 thousands products or if you applied multiple changes on your categories and products' names.
On a specific shop, I noticed this table had grown to weight more than 4GB, having a very negative impact on the shop's performances.
Besides other issues, the catalog url rewrite index couldn't run to completion anymore leading to some products being unavailable for sell in the catalog.
Also, the category and product pages took more than 2 seconds to load which had a very bad impact on the shop's conversion rate.

If you notice similar issues on your Magento shop, here are the steps that allowed me to reduce the `core_url_rewrite` table size from 4GB to 30MB, resulting in the average load time for category and product pages reduced by 300%!
Your catalog will be much more pleasant to browse for your customers which in return will buy more of your products.

Step 1: Modify the mage_catalog_model_url model
-----------------------------------------------

Beware, every time you want to make a change in Magento's core functionnalities, don't edit core files but make your changes in a module as described in the [official documentation](http://devdocs.magento.com/guides/m1x/magefordev/mage-for-dev-1.html).
This way you will be able to update Magento without loosing the customizations specific to your shop.

In the `getProductRequestPath` method, replace:

```php
if ($product->getUrlKey() == '' && !empty($requestPath) && strpos($existingRequestPath, $requestPath) === 0 )
```

with:

```php
if (!empty($requestPath) && strpos($existingRequestPath, $requestPath) === 0 )
```

Step2: Empty the core_url_rewrite table
---------------------------------------

**Beware, you will permanently loose your custom url rewrites after you empty the `core_url_rewrite table`**, which can have a negative impact on your SEO.
If you're unsure how to handle this, I suggest you hire the services of a SEO expert.

Run the following SQL commands on your server:

```sql
use mydatabase;
truncate table core_url_rewrite;
```

Step3: Reindex and empty cache
------------------------------

```bash
php shell/indexer.php --reindex catalog_url
rm -R var/cache/*
```