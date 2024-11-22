---
layout: page.njk
title: The What & The Why
date: 2024-01-01
eleventyNavigation:
    key: The What & The Why
    parent: My Home Server
---
# My Home Server
## The What & The Why

### A Simple Start

In late 2022 I started moving away from proprietary cloud software and relying more on my own infrastructure. Things started simply enough: a headless Raspberry Pi with an external harddrive connected to my router. I used Tasker to setup automation on my and my wife’s phones so that every night all of the photos we had taken that day (having twin toddlers means there are a lot of photos) are backed up to the harddrive and made available to browse and view instantly via a media server we can access from any of our devices.

Since then the server has expanded _a lot_ as I've gone down the rabbit hole...

### The Hardware

- A self-built mini-ITX formfactor Proxmox PC with an 11th Gen Intel Celeron SoC and 32GB DDR4 RAM.
- The OG Raspberry Pi 4B I started with is still riding strong. At this point it's just running a few Docker containers I haven't migrated to the new machine yet but once it's freed up I'm going to explore using it as a dedicated router & firewall with something like OpenWRT and IPFire.
- A Raspberry Pi 4B with USB-stick Z-Wave and Zigbee radios that runs HomeAssistant OS.
- Fairly basic networking hardware: ASUS RT-AX58U router flashed with custom firmware (Asuswrt-Merlin), an ARRIS SURFboard modem, and an old TP-Link Archer A7 router that I'm using as an access point.
