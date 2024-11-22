---
layout: page.njk
title: Local Notifications
date: 2024-01-13
eleventyNavigation:
    key: Local Notifications
    parent: My Home Server
---
# My Home Server
## Local Notifications

While I've done a lot of work to set up various monitoring services, those aren't all that useful when I'm away from my computer. One thing that had been on my to-do list for a while was setting up local notifications. In the past I have used Telegram bots (I've written more about that <a href="">here</a>), and though those worked well enough I just didn't love relying on an outside service like Telegram, especially with more sensitive notifications and alerts.

### ntfy

One name I had seen frequently while researching was <a href="https://github.com/binwiederhier/ntfy">ntfy</a>. While it can be nice to have software with all kinds of bells & whistles, I was drawn to the simplicity of ntfy. It's a basic HTTP-based pub-sub service that can be easily plugged in to all manner of applications. Importantly for my needs and interests it's fully open source, easily self-hostable, and has an open-source Android app (bonus points for offering the app via F-Droid!).

While ntfy is offered as a Docker image I have been trying to use LXC's when possible, so I threw one together with the help of a tteck script and dug in. Upon opening the IP:Port in my browser I was immediately greeted with a "notifications not supported" message! No HTTP allowed! At this point in my experience this is a trivial problem (I've written more about that <a href="">here</a>) so I ran through my ususal process...

First I popped over to Nginx Proxy Manager and created a new proxy host for a new ntfy subdomain. I set the IP and port to forward, assigned it my standard domain SSL certificate (a Let's Encrypt cert using DNS Challenge 01), flipped on the "force SSL" and "HTTP/2 support" toggles, and saved it. Then its over to my Pi-Hole instance to create a local DNS record pointing the ntfy subdomain to my NPM IP.

Now for a little editing of the ntfy config (located at `/etc/ntfy/server.yml`). I needed to set the `base-url` to the new HTTPS address I just set up and to set `behind-proxy` to `true` but I also wanted to make a few other changes, namely setting up notification caching. At the moment I'm not exposing _any_ of my services to the open internet, so there are likely to be some times where I'm inaccessible (maybe I'm out of the house and forget to turn on Wireguard) and I certainly don't want to miss out on any notifications. I'm also curious about some of the more extravagent notification options that ntfy supports so I set up a cache directory for attachments, too.

```
base-url: "https://ntfy-subdomain.maindomain.xyz"
cache-file: "/var/cache/ntfy/cache.db"
cache-duration: "12h"
behind-proxy: true
attachment-cache-dir: "/var/cache/ntfy/attachments"
attachment-total-size-limit: "500M"
attachment-file-size-limit: "100M"
attachment-expiry-duration: "24h"
```

I save my config, reboot the LXC, and head to the new address in my browser. No more error message! I open the app on my phone and subscribe to a new topic, which is as simple as making one up! I enter `test` and check the box for "use another server" (the default is the public ntfy server) and I enter mine. Back in my browser I click "publish notification," enter `test` as the topic name, and enter a little bit of nonsense in the title and message fields. A click on send and _ding_ there it is on my phone. Simple!

I did notice that the app was telling me that it would be better if I connected via websocket. I tapped "enable" and my `test` subscription fell into the pit of endless "reconnecting..." so I was definitely going to have to do a little more than just click enable! Turns out, not much more: NPM has a toggle switch for "Websockets Support" when configuring a proxy host. Now I was back in business - though with a new note jotted down: learn about websockets.

<a href="/projects/a-homelab/"><b>Back to Homelab Project Page</b></a>
