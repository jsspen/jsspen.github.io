---
layout: page.njk
date: 2024-12-01
title: Trying to Run a Local LLM | Jordan Spencer
eleventyNavigation:
    key: 2024-12-01 &mdash; Trying to Run a Local LLM
    parent: My Home Server
---

# Trying to Run a Local LLM
<div class="post-date">2024-11-13</div>

I far from being an AI evangelist so when building my server optimizing it for running LLMs was not on my priority list... but as navigating the top layer of the internet has become increasingly difficult, I have found myself turning to GPT

however, I'm always curious about what I can get away with doing completely "in house" and .

<img src="/imgs/openweb-ui.png" width="15%" class="float">

I noticed there was a Proxmox <a href="https://community-scripts.github.io/ProxmoxVE/scripts?id=openwebui">helper script</a> (<a href="https://github.com/community-scripts/ProxmoxVE/discussions/237">RIP tteck</a>) for creating an Open WebUI LXC, so I figured I might as well check it out. I installed Ollama in the container and started poking around. The first thing I had (wanted) to do was disable multi-user support, which is on by default in Open WebUI. This is something that so far I have never had a need for and even with a trusty password manager auto-filling things, it's still annoying to have to login to something (which is only accessible on my LAN) when I want to use it. One thing that can be a little bit troublesome is figuring out how to change things like environment variables when using one of the helper scripts to install the LXC.

The first thing I always do is just run a `systemctl status` command and take a look at what services are running, what files they're running, and what commands/flags it's using to run them. I found the `.env` file and added the necessary line to turn off logins: `WEBUI_AUTH=False`. I restarted the service and checked out the dashboard.

I discovered that though I had installed Ollama alongside Open WebUI, I didn't get any 'default' model or anything like that with it. There's a nice interface in the Open WebUI settings that allows you to enter the name and tag of a model you want to use and it'll handle pulling it in. It linked to the Ollama models directory. I assumed a small model would be pretty large so I had allocated 50gigs to the container... and then I saw that the model that performs at a GPT-4o level (<a href="https://ollama.com/library/llama3.1">llama3.1</a>:420B) was about a quarter TB. I knew I wasn't going to do all <i>that</i> but I shut down the container and allocated another 50GB to it before I bothered moving forward. I browsed around and tried to make a sensible choice. I grabbed the two smaller models of llama3.1 (8B and 70B) and I grabbed <a href="https://ollama.com/library/mistral">mistral</a>:7b (just because it was the placeholder text in the pull field).

<img src="/imgs/ollama.png" width="15%" class="float-right">

I decided to start by testing the largest and move down to smaller depending on the results. It was easier to determine than I expected because I couldn't get <i>any</i> output from either of the llama3.1 models or mistral. All three models threw me a 500 error. A little digging on GitHub points to this likely being an issue of power/resources being inadequate for the model you're attempting to use.

So I slunk down to the bottom and pulled <a href="https://ollama.com/saikatkumardey/tinyllama">tinyllama</a>:latest (1b) to give it a shot. I have a family member undergoing a medical procedure this week so I entered a prompt asking for ideas of foods to eat in the restrictive days leading up to the procedure. After about 20 seconds of waiting it started to output it's answer. I let it chug along, outputting a new word every second or two. After a few minutes it was done and it's response totaled 269 words. It should come as no surprise that it was... kinda bad. It actually changed the name of the procedure to an entirely different word at one point and the first few sentences didn't really make sense grammatically (or in the context of the question for that matter). Most of the output wasn't what I had asked for, either. It spent a fair amount of the answer encouraging "positive thinking" and reaching out to friends for support, which seemed particularly odd.

I had walked away while it was working and I received a notification on my phone: a "critical" alert from Netdata warning that on my server the average CPU utilization for the last 10 minutes (excluding iowait, nice, and steal*) was at 97%! Yikes. I had submitted the prompt to the model at 11:22AM, received the 10min CPU usage warning at 11:31AM, and at 12:04PM I finally received a recovery alert that informed me the alarm had been raised for a total of 11 minutes.

One thing I didn't realize was that while the LXC had been assigned all 4 cores of my CPU, it was only assigned 4GB RAM (512MB swap). So I bumped that up to 8GB (swap 1GB) to give it another shot. This didn't make any noticable difference. Again, it took about 20 seconds to start answering. I left the UI and took a look at the system and could see that CPU was once again maxxing out, running at 98-100% even after the model had finished answering, while the RAM useage stayed under 25%. I guess RAM doesn't make much of a difference in this case!

I'm <i>sure</i> that there are optimizations I could make, especially with allocating resources and prioritizing the CPU cores/threads (my other containers were all running concurrently while I was testing) but for now my curiosity is satiated and the container has been wiped. Maybe another time!

<br>

---
<br>
* Steal? That was a new one to me. Here's a helpful explanation I found about it <a href="https://gridpane.com/kb/an-introduction-to-cpu-steal-i-o-wait-and-the-top-command/#cpu-steal">here</a>.
<blockquote>
"In a nutshell, CPU steal is CPU time that is stolen from a VPS by the hypervisor (AKA the virtual machine monitor / VMM).

Your VPS shares resources with other instances that also exist on the same server and CPU cycles are one of those shared resources. Unlike RAM, which has a specific, set limitation, CPU is more flexible. CPU cycles are shared across other instances that exist on the same server.

For example, if your VPS was one of 10 equally sized instances on one server, its CPU isn’t capped at 10%. You could potentially go above your allocation and steal from other instances on your server, and the same is true for them having the potential to steal from you.

If your VPS displays a high %s in top, this means CPU cycles are being taken away from you by other instances/hypervisor processes (more info in the next section). The more steal you experience, the more your servers performance will suffer."
</blockquote>

