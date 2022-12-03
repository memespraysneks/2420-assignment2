# 2420-assignment2

## Step 1: Creating Infastructure

In order for this to be successful we will need to create certain infastructure. This will entail a VPC, 2 Droplets, a Load Balancer, and a Fire Wall. For instructions on how to do that follow along with the video below.

https://vimeo.com/775412708/4a219b37e7

## Step 2: Creating Users and Setting up SSH

The first thing that we will need to do is create users on both of the droplets as well as give them sudo privilages. In order to log in to your doplets you will need to create a SSH key pair for security. Once this is done you can add users and restrict what they can do with root privilages. All of the information on how to do this is in the following video. Note that you can use the same key for both droplets.

https://vimeo.com/758870226/f75da348fc

Once this is done ensure that you are running the latest version of Ubuntu by running the following commands

```
sudo apt upgrade
sudo apt update
```

## Step 3: Installing Web Servers on Droplets

The next step is to set up a web server on both of your droplets. In this guide we will be using caddy. In order to install caddy onto your droplet once you are log into it use the following commands.

```
wget https://github.com/caddyserver/caddy/releases/download/v2.6.2/caddy_2.6.2_linux_amd64.tar.gz
tar xvf caddy_2.6.2_linux_amd64.tar.gz
sudo chown root: caddy
sudo cp caddy /usr/bin/
```

Doing this will add caddy onto your user, give the ownership of it to the root user and then copy it into your user's bin directory so it can be accessed.

## Step 4: Creating index files and installing Node

Now that all this is done the next step is to start creating files. The easiest way to do this is to create documents on your host then copy the files onto both the droplets.

Once you've created a directory to contain all your files start by making 2 more directories called HTML and src. To do this use the following commands

```
mkdir HTML
mkdir src
```

Once this is done we are going to move into the HTML directory and create a new HTML file using your prefered text editor. The file should be called Index.html. 

```
vim html/index.html
```

Once you are in the file add the following to it.

```
<!DOCTYPE html>
<html lang="en">
<html>
    <head>
        <meta charset="UTF-8" />
        <title>Example Site for 2420</title>
    </head>
    <body>
        <h1>We take those!</h1>
    </body>
</html>
```

The next thing we will need to do is to ensure that both voltra and node are installed. This is not a requirement to do on your host machine, but is necessary for the droplets. In order to do this use the following commands

```
curl https://get.volta.sh | bash
source ~/.bashrc
volta install node
```

The next thing we'll want to do is to initialize a new git repository in our current directory and to install a module called fastify to do that use the following command.

```
npm init
```

When you're prompted you can simply just press enter until it resolves unless you want to change certain aspects of it. Then run the following command

```
npm i fastify
```

Once all of this is set up we will move into our src directory and create a new file called index.js using your prefered text editor.

```
vim src/index.js
```

Inside we are going to add the following content.

```
// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const fs = require('fs')

// Declare a route
fastify.get('/api', async (request, reply) => {
          return { hello: 'Server X' }
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: 5050 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
```

This will be used later by another file to load a message for an api request. Currently it will give the response "{ hello: 'Server X' }"

## Step 5: Creating a Caddyfile and a caddy.service file

The next step will involve the specific IP of your VPC. First we are going to create a file called Caddyfile. 

```
vim Caddyfile
```

 Its contents will be as follows.

```
http://VPC IP GOES HERE {
        root * /var/www
        reverse_proxy /api localhost:5050
        file_server
}
```

Once this is done we will create another file called caddy.service.

```
vim caddy.service
```

The content will be as follows.

```
[Unit]
Description=Work as intended and help me run my js based server
After=network.target

[Service]
Type=notify
ExecStart=/usr/bin/caddy run --environ --config /etc/caddy/Caddyfile
ExecReload=/usr/bin/caddy reload --config /etc/caddy/Caddyfile --force
TimeoutStopSec=5
KillMode=mixed

[Install]
WantedBy=multi-user.target
```

## Step 6: Installing Node and Volta on your droplets

Now we'll be repeating step 4 but instead of on our local machine we'll be doing it on our droplets. I've added the commands here again for your convience.

```
curl https://get.volta.sh | bash
source ~/.bashrc
volta install node
```

```
npm init
```

```
npm i fastify
```

## Step 7: Creating a Application to run your Node services

In this step we will be returning to our local machine to create another file called hello_web.service.

```
vim hello_web.service
```

It's contents should be as follows

```
[Unit]
Description=Run a js file to serve an HTML file with Caddy
After=network.target

[Service]
User=droplet
Group=droplet
Type=notify
ExecStart=/home/YOUR USERS NAME GOES HERE/.volta/bin/node /home/YOUR USERS NAME GOES HERE/assignment/src/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## Step 8: Moving files onto the droplets

In order to copy files from our host machine and put them on the droplets we will be using the sftp command. The sftp command is used as follows.

```
sftp -i /path/to/ssh/key USER@DROPLET IP GOES HERE
```

Once you are in your first droplet use the following commands

```
mkdir assignment
cd assignment
put Caddyfile
put caddy.service
put hello_web.service
put HTML/index.html
mkdir src
cd src
put src/index.js
```

Once you're done all this you can exit sftp by using the "bye" command. Now we're going to enter into our droplet using SSH. Once you are in your droplet use the following commands to ensure that all the files that we just moved are in the correct place for our system to access them.

```
sudo mkdir /etc/caddy
sudo mv Caddyfile /etc/caddy
sudo mv caddy.service /etc/systemd/system/caddy.service
sudo mv hello_web.service /etc/systemd/system/hello_web.service
sudo mkdir /var/www
sudo mv index.html /var/www/index.html
```

Finally we are going to enable all of our services and start them up so that they can be accessed. To do this use the following commands

```
systemctl enable caddy.service
systemctl start caddy.service
systemctl status caddy.service

systemctl enable network.service
systemctl start network.service
systemctl status network.service
```

Once you're done with that do the same process for your second droplet and then you're all done your set up! Note: If you'd like to more easily see the difference in the two dropletes it's recommended to change both the index.html and index.js to contain slightly different messages.

## Step 9: Test that things work

Now go ahead and test that everything is working. Return to your local machine and in a web browser of your choice go to the IP of your Load Balancer. When you connect reload the page a couple of times and if you changed the index.html in droplet 1 and droplet 2 to be slightly different you'll be able to easily see that both are being accessed. Once you've tested this the final test is to go to the IP of you Load Balancer/api i.e. (123.123.123.123/api) and check that your api is coming from both of your droplets. If so then you have successfully created your droplet and load balancer set up congratulations!
