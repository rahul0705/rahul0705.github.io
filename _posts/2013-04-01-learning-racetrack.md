---
title: Learning Racetrack
toc: true
toc_label: Project Timeline
toc_sticky: true
categories:
  - Projects
tags:
  - projects
  - community service
  - raspberry pi
---

Engineering Projects In Community Service or better known as EPICS was created to provide innovative solutions for nonprofit organizations by university students. There are multiple teams within EPICS each of these teams specialize in some type of project.

The Greater Lafayette Elementary Education Team or better known as GLEE strives to promote and develop interest for engineering by creating a classroom experience where interactive, inquiry-based exhibits expand math, science, technology, and engineering concepts. The mission of the GLEE team is to design and create hands-on projects at the Happy Hollow Elementary School to foster the middle school students' interest in learning.

GLEE is separated into two teams. The learning racetrack and the robotic arm team. The goal of the learning racetrack team is to help 6th grade students grow interest in learning. The learning racetrack was started in 2006, and worked properly for the project partners when delivered.

## Summary of project

The project is designed to entice students to race head to head with each other by answering questions within different subjects. These can be broken down to two types of questions, Math related question, and multiple choice questions.

* Math
  * Binary to decimal conversion
  * Decimal to binary conversion
  * Arithmetic
  * Basic Algebra

* Multiple Choice
  * English
  * Science
  * History
  * Etc

Students are presented question on an Android device which if answered correctly will move the car incrementally on the racetrack. The first student to finish 3 laps wins.

### Week 1

![Original Racetrack](/assets/2013/original_track.jpg)

#### Problems/Tasks:
Over the years the project began to become unreliable. Some of the issues that we found was that the cars were flying off the tracks when they were racing, the keypads were not working consistently, some of the cars were unresponsive, wires were unorganized and not connected well, and the cars were either going too fast or too slow.

#### Accomplishments:
Asses the project.

#### Decisions:
As a team we decided to scrap the project and start from scratch.

#### Reflections:
We decided to scrap the project so we can add more to it. We found out it would be cheaper and easier for our project to include more functionality. After looking at the wiring of the original project we found that it would be inefficient to solve all the wiring issues. We felt the case and the controller limited the interaction with the racetrack. The case made it hard to power the racetrack as well as interact with the cars on the racetrack. One aspect that we wanted to make sure made it through our entire project is that the students can play with the racetrack; they would not be restricted from interacting with the racetrack.

### Week 2

#### Problems/Tasks:
There were two main problems we tackled this week, how will the students interact with the racetrack and how will we move the cars when we verified a correct answer. The way students interacted with the current track was through a keypad. This limited the interaction by only allowing numbers to be entered as answers. Currently the way we moved the cars through the race track was through a jungle of wires and a logic board that was running undocumented assembly. Any new implementation would need to be simpler to develop and well documented.

#### Accomplishments:
We came up with an initial design.

#### Decisions:
We decided on going with a Raspberry Pi since it was well documented and built for the K-12 market sector. We thought that an Android device would be great for students to interact with the racetrack since in allowed three major changes to the way students answered questions. Android allows for both number and text input. This removes the restriction of students only answering questions with numbers. We could also allow for multiple choice questions. Android is also very well documented.

#### Reflections:
We had several ideas on how to move the cars, we could go with the more traditional way which is to use an Arduino board, or use a new piece of technology that came out, the Raspberry Pi, both have their advantages and disadvantages. The Raspberry Pi was cheap and easily expandable while the Arduino would be harder to develop for since no one in our team had any exposure to it. As for how the students will interact with the track we felt that staying with the old keypads would be a bad idea. We were hoping for something that would expand the range of questions, this brought us either to a mobile device or a set of touch screens. Although the touch screens would be a cheaper alternative to Android devices, creating a graphical user interface on a touch screen would not be as user-friendly as it would be on an Android device. In attempting to keep this project simple we wanted to use as many pre-existing solutions as we could find so that we can minimize our time in development and error testing. We also wanted to make sure that everything we built and used was well documented so that future students working on the project could easily maintain it.

### Week 3

#### Problems/Tasks:
The main problem solved this week was the question of how teachers would input questions into our system. Currently questions were generated by the logic board. Now that the type of questions were expanded we had to find a way for how the teacher could control which questions would be displayed.

#### Accomplishments:
Designed how teachers would input questions into the system.

#### Decisions:
We decided that teacher would enter questions on any computer that has access to a USB drive. Teachers would use a program to take any number of questions they would like to be asked on the Android devices and format those questions into a file. That file would then be placed onto a USB drive by the teacher and inserted into the Raspberry Pi. The Raspberry Pi would parse the questions within the file and send those questions to the Android devices. We choose the way of altering questions since it would give the teacher the freedom of creating question in any machine while still keeping the question within the scope of what the Android application could handle.

#### Reflections:
We decided that the process of adding questions to our system needed to be as simple and easy as possible. One idea would be to allow to teachers to add questions using the Android devices. We decided against this since entering long fields of text in one sitting would be too long and tedious on an Android device. Another idea would be to connect the Raspberry Pi to a monitor and keyboard and have the teacher add the questions directly to the Raspberry Pi. We found this to be very inconvenient for the teacher, since finding a readily available monitor and keyboard would be difficult within a school environment. We thought of using a USB drive with a python script that would facilitate the input of questions and answers by the teacher.

### Week 4

#### Problems/Tasks:
We had to start gathering all the items we will be requiring for this project. We were requested to complete a budget since our project would cost more than $200.

#### Accomplishments:
Found most of the items for our budget

#### Decisions:
We still needed to research on what device we would use for the students to interact with the racetrack. We narrowed it down to a cheap Walmart tablet or a Samsung Galaxy media player.

#### Reflections:
Most of the pieces we need to budget had already been decided on. We needed to find where we could buy these pieces for as cheap as possible while still ordering from an authorized seller. Most of our pieces would be coming from element14.com and amazon.com since they had the best price for the parts.

### Week 5

#### Problems/Tasks:
An itemized budget needed to be created. We needed to make sure that we spent as little as possible so that the overall cost of maintenance would be low.

#### Accomplishments:
An itemized budget was created and submitted.

#### Decisions:
We decided that finding low-priced materials would be best. Our biggest expense was the Android devices. We wanted a device that could present all the questions while still being spacious. After looking at multiple devices we decided to buy a used device. A moderately used device would offer us a device with close to new specifications at a lower price. We also decided that the device needs to be from a reputable manufacturer. We decided to go with a Samsung galaxy media player.

#### Reflections:
The biggest issue was getting the cost down was the Android device. We wanted to make sure that the device would be easy to develop for since there have been known errors from buying Android devices from non-reputable manufacturers. We were also worried that a cheaper device may not have enough screen real estate to display the desired information. In the end we decided on using a used Samsung device, since Samsung sells the most android devices of any other manufacturer, which made sure that any software/hardware issues could easily be dealt with.

### Week 6

#### Problems/Tasks:
Start develop on Android application.

#### Accomplishments:
Created an android application that test users on their ability to convert binary to decimal.

#### Decisions:
We decided to create a simple Android application. The application ask you user to convert a binary number to a decimal number. Then it would give feedback on whether the user answered convert the number correctly. The application interfaced with the default Android keyboard to ask the user for input. Whenever the use pressed done on the keyboard the typed answer was evaluated and a Toast pop-up with the words “You are right” or “You are wrong” were displayed to the user. We used a Toast pop-up vs a dialog pop-up to give feedback to the user so that no response is needed from the user to continue to the next questions.

#### Reflections:
We created an Android application to see how we would like to present the information to the user. This application is a good start to see how to format questions for the user, how the user inputs their answers, how the user is notified about their answer, and how the user moves on to the next question. Using this as a base we can further improve on the application and add more styles of questions.

### Week 7

This week we had a design review. We presented our project to the corporate sponsors. Companies include Eaton and PPG, but there are plenty others. We demoed our application and spent some time answering question on how durable our design would be, as well as what was the main push for creating the project from scratch.

### Week 8

#### Problems/Tasks:
Submit order form for parts. Start documenting what our question would look like and what is in the scope of a question. We had to decide how many characters each answer could be, and what kind of question required what kind of answer scheme.

#### Accomplishments:
Submit order form for parts. Started design documentation on how question can be formatted.

#### Decisions:
We decided to create a design document for the types of questions to use for the Android application. The design document clearly states the scope of what questions will be included in the application. We decided that 20 characters or less for any answer will allow the text to be displayed legibly on the screen. Multiple choice questions are limited to 2 or 4 answers so that all answers can be displayed on the screen at once. We also decided on which type of math questions will be included into the application.

#### Reflections:
We decided before continuing to write our application that we should clearly state what kind of questions we can receive and how they should be handled. This allows us to create our application to have different screens depending on what type of question is being asked. This creates a much cleaner looking interface.

### Week 9

#### Problems/Tasks:
Setup Raspberry Pi and other materials that have arrived.

#### Accomplishments:
Installed operating system on the Raspberry Pi.

#### Decisions:
We went with Raspbian "Wheezy" since it is one of the "officially" listed operating systems on Raspberry Pi [website](http://www.raspberrypi.org/downloads). This OS comes with most features we need pre-installed.

#### Reflections:
Things to note about Raspbian "Wheezy" is that even though it is based on [Debian](http://www.debian.org/) it does not contain all software that Debian; most of the software for this project can be found within Raspbian "Wheezy". Default login information:

```bash
Username: pi
Password: raspberry
```

### Week 10

#### Problems/Tasks:
Start research on what will be required to use the Raspberry Pi's GPIO ports. Find out more information about how the Raspberry Pi's GPIO ports work and what they can and cannot do.

#### Accomplishments:
Found several resources explaining in detail about the Raspberry Pi's GPIO ports. [Embedded Linux](http://elinux.org/RPi_Low-level_peripherals) is a great resource to find out more about the Raspberry Pi's low-level peripherals.

#### Reflections:
There was some very interesting quirks with the Raspberry Pi that must be noted. The GPIO ports can only send 3.3V with 2 mA to 16 mA. The GPIO ports are also not 5V tolerant and there is no over-voltage protection. Included is a picture of the port and what there functions are.

![Raspberry Pi GPIO](/assets/2013/gpio.png)

### Week 11

#### Problems/Tasks:
Start writing software for teachers to create new questions. Start writing code to use the Raspberry Pi's GPIO ports.

#### Accomplishments:
Team has started working on code for teachers. Found [sample code](https://github.com/jaye773/epics_binary_track/blob/master/gpioControls/buttonLED.c) that turns on an LED on button press. Found a tutorial on how to use the GPIO port to send signals and also take input if necessary [here](http://log.liminastudio.com/writing/tutorials/tutorial-how-to-use-your-raspberry-pi-like-an-arduino).

#### Decisions:
We decided to go with Python for our Question code since there are easy ways to make it an executable and development of code would be quite easy. We have selected GPIO ports 23 and 24 to use since they are serve no other predefined function making debugging much easier.

#### Reflections:
We went with C code for the GPIO since it is much easier to connect to the ports in C and send out signals than it would be in Python or Bash.

### Week 12

#### Problems/Tasks:
Get the moveCars.c program to compile and run. Start wiring our circuit to connect the Raspberry Pi to the racetrack.

#### Accomplishments:
We had to install WiringPi from source so we would have full functionality of the GPIO ports. Debugged several issues with MoveCars.c with GPIO numbering conventions. We also using a bread board had a functional circuit to send signals from the pi to the track.

#### Reflections:
We followed the instructions posted by the creator [here](https://projects.drogon.net/raspberry-pi/wiringpi/download-and-install/). We had a few issues installing it with github until we did a full system update. Once that was installed we found out our code has to be compiled with the wiringPi library:

```bash
gcc -o moveCars moveCars.c -lwiringPi
```
We have to run our GPIO code as sudo:

```bash
sudo ./moveCars 1
```

### Week 13

#### Problems/Tasks:
Create code for transferring question files to each of the android tablets.

#### Accomplishments:
We can dynamically mount the USB drive whether at startup or while the game is running.

#### Reflections:
We had an issue where the USB drive would change letter names from sda to sdb to sdc or sdd or sde randomly at startup. This can be found by typing the following command:

```bash
ls /dev/sd?1
```
This will result in some output like:

```bash
/dev/sda1
```
This means that we must mount /dev/sda1 to /media/usb0 with this command:

```bash
sudo mount /dev/sda1 /media/usb0
```
We were able to fix this issue by installing software called [usbmount](http://usbmount.alioth.debian.org/). This will auto-mount USB drives when the operating system is already running. A major issue encountered while trying to get this to work is that the USB drive has to be directly connected to the USB port on the Raspberry Pi without the use of a USB hub or a USB extender cable. External Sources that helped with Debugging: [Mounting random USB drives to a mount point](http://www.raspberrypi.org/phpBB3/viewtopic.php?f=26&t=38105), [How to Mount USB Disks on Raspberry Pi](http://ccollins.wordpress.com/2013/02/04/how-to-mount-usb-disks-on-linux/), [Unable to mount USB Stick on RPi](http://www.element14.com/community/thread/21093), [How to mount a USB drive to your Raspberry Pi](http://frustrateditengineer.wordpress.com/2012/09/23/how-to-mount-a-usb-drive-to-your-raspberry-pi/), [How to mount and use a USB hard disk with the Raspberry Pi](http://raspi.tv/tag/mount-usb-hard-drive-on-raspberry-pi)

### Week 14

#### Problems/Tasks:
We have started to mount everything to base.

#### Accomplishments:
The Raspberry Pi has been mounted on the base. We have added an external cable that connect to the power so that the user does not have pull out the surge protector out of the base to power the entire project up. We have also soldering the wires for the Raspberry Pi to the track.

#### Reflections:
We have found a few issues with the old cover so we have gone away with that idea. Also we have to find a proper way to secure all the wires and the Android tablets during use.

### Week 15

#### Problems/Tasks:
Finish mounting items on the base and secure everything

#### Accomplishments:
The base has the track secured to it. The Android tablets have been labeled so we can identify who is in the inner track vs who is in the outer track. We also have a place inside the base to store the cars and Android tablets when not in use. We have hot glued all the connections that are exposed so that they cannot be accidentally unplugged.

#### Reflections:
We have found a way to hide all the cables that connect the track to the Raspberry Pi. We drilled a small hole in the base and ran all the cables through there and we then placed the track on top of that whole so these sensitive wires are not exposed.

![Completed Racetrack](/assets/2013/completed_track.jpg)

All source code can be found on [github](https://github.com/jaye773/epics_binary_track)
