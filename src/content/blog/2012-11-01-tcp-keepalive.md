---
title: TCP Keep-Alive
description: Research into TCP keep-alive behavior across operating systems and network failures.
coverImage: ../../assets/covers/network.jpg
categories:
  - Projects
tags:
  - projects
  - networking
  - TCP
  - research
---

This is a research project I had the opportunity to work on for sometime. This project involved analyzing the TCP
Keep-Alive (Request for Comments Here) and how it is implemented across different operating systems.

For those who do not know what TCP Keep-Alive is, here is a Wikipedia summary:

> TCP keep-alive is a message sent by one device to another to check that the link between the two is operating, or to
> prevent this link from being broken. This signal is often sent at predefined intervals, and plays an important role on
> the Internet. After a signal is sent, if no reply is received the link is assumed to be down and the application can
> decided whether to close the connection.

I have included the source code so that you can test these for yourself. To test this you are required to have two
machine, run the server code on run and the client on the other. Once a connection has been established and messages
have been flowing from the client to the server unplug the network cable from the client and see what the server will
respond and then do the same while unplugging the server. Through the research we found interesting results. If the
server silently fails, the client will keep sending messages without causing socket failure. This is not how keep-alive
should work. This issue has been persistent through many different Linux distributions.

[Download the TCP keep-alive source code](https://github.com/rahul0705/tcpkeepalive) with its Makefile.
