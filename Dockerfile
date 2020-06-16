FROM node:slim

#Set Env
ENV LC_ALL C.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8
ENV ANDROID_HOME=/opt
ENV PATH=$ANDROID_HOME/platform-tools:$PATH

#Update OS
RUN apt-get update
RUN apt-get upgrade -y

#Install Frida
RUN apt-get install -y curl unzip bash git nano gcc-multilib zlib1g-dev lib32z1-dev python3 python3-dev python3-pip git autotools-dev automake
RUN pip3 install colorama prompt-toolkit pygments
RUN pip3 install frida
RUN npm install frida

#Install Adb 
RUN mkdir -pm 0750 ~/.android $ANDROID_HOME 
RUN curl -fsSL https://dl.google.com/android/repository/platform-tools-latest-linux.zip -o /tmp/adb.zip
RUN unzip /tmp/adb.zip -d $ANDROID_HOME 

#Install server
RUN mkdir -p /home/node/app/node_modules
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

RUN chmod +x run.sh
CMD [ "sh", "run.sh" ]