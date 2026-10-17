---
title: TCP Keep-Alive
description: Testing how TCP keep-alive handles disconnected cables and silent failures across operating systems.
coverImage: ../../assets/covers/network.jpg
coverImageAlt: Server racks with bundled yellow network cables and illuminated status lights
section: Projects
tags:
  - networking
  - tcp
  - research
---

I worked on a research project looking at TCP keep-alive across operating systems. The question was fairly simple:
what happens to a connection when the machine on the other end stops responding?

TCP keep-alive lets one end of a connection check whether the other end still responds. If those checks go unanswered,
the connection may need to be closed. Knowing how that is supposed to work and seeing what happens when you pull a
network cable are two slightly different ways of understanding it.

We looked at the second one.

I've included the source code if you'd like to try the same tests. You'll need two machines: run the server on one and
the client on the other. Once they're connected and exchanging messages, unplug the client's network cable and watch
what the server does. Repeat the test by unplugging the server's cable instead.

In our testing at the time, a silent server failure could leave the client sending messages without a socket failure.
That wasn't the behavior we'd expected, and we observed it across multiple Linux distributions. These are notes from
that research, rather than a claim about how every current system behaves.

[Download the TCP keep-alive source code](https://github.com/rahul0705/tcpkeepalive) with its Makefile.
