---
layout: post
title: "Améliorer les performances de Magento"
date: 2017-01-23 10:55:40 +0200
categories: Technical
tags: [magento, performance]
excerpt: Cet article décrit comment améliorer les performances de Magento en optimisant la table core_url_rewrite.
image: /images/database-schema.png
lang: fr
ref: magento-performance
---

Magento enregistre toutes les redirections d'url vers les pages catégories et les pages produits dans la table `core_url_rewrite`.
Dans certains cas cette table peut devenir énorme, notamment si votre boutique contient plus de 10000 produits ou si vous avez effectué de nombreuses modifications sur les noms de vos catégories ou de vos produits.
Dans le cas d'une boutique en particulier, je me suis rendu compte que cette table avait grossi jusqu'à peser plus de 4GB, avec pour résultat un impact très négatif sur les performances du site.
Entre autres, l'index de réécriture d'url du catalogue n'arrivait plus à s'exécuter jusqu'à complétion, certains produits étant alors inaccessibles aux acheteurs potentiels visitant le site, et le temps de réponse du serveur pour les pages catégorie et les pages produits était excessivement long, aux alentours de 2 secondes, ce qui de même a un impact très négatif sur le taux de conversion d'une boutique en ligne.

Si vous remarquez de tels soucis sur votre boutique Magento, voici les étapes qui m'ont permis de réduire la taille de la table core_url_rewrite de 4GB à 30MB, avec comme résultat la réduction du temps de réponse moyen pour les pages catégorie et produits de 300% !
Votre catalogue sera beaucoup plus agréable à consulter pour vos clients qui vous le rendront bien en achetant plus !

Étape 1 : Modifiez le modèle Mage_Catalog_Model_Url
-----------------------------------------------

Attention lors de toute modification sur les fonctionnalités de Magento, il ne s'agit pas d'effectuer les modifications directement dans les fichier core de Magento mais d'étendre les fichiers existants à l'aide d'un module, comme décrit dans la [documentation magento](http://devdocs.magento.com/guides/m1x/magefordev/mage-for-dev-1.html).
Ainsi, il sera possible de mettre à jour Magento sans risquer de perdre toutes les fonctionnalités propres au magasin.

Dans la méthode `getProductRequestPath`, remplacez :

```php
if ($product->getUrlKey() == '' && !empty($requestPath) && strpos($existingRequestPath, $requestPath) === 0 )
```

par :

```php
if (!empty($requestPath) && strpos($existingRequestPath, $requestPath) === 0 )
```

Étape 2 : Videz la table core_url_rewrite
---------------------------------------

**Attention, vous perdrez définitivement vos réécritures d'url personnalisées après avoir vidé la table `core_url_rewrite table`**, ce qui peut avoir un impact négatif sur votre SEO.
Si vous n'êtes pas certain de la meilleure manière de gérer cette étape, je vous recommande de louer les services d'un expert SEO.

Sur votre serveur, exécutez les commandes SQL :

```sql
use mydatabase;
truncate table core_url_rewrite;
```

Étape 3 : Ré-indexez et videz le cache
-------------------------------------

```bash
php shell/indexer.php --reindex catalog_url
rm -R var/cache/*
```
