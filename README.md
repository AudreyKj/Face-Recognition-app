# Face-dectection, selfie imageboard made with Vue.js

![screenshot 1](screenshot_imageboard-1.png)
![screenshot 1](screenshot_imageboard-2.png)

Vue.js app using the face recognition API [face-api.js](https://github.com/justadudewhohacks/face-api.js). <br /><br />

Users' webcams are connected to the site and their faces are automatically detected by the API.
The API visually indicates its assumptions on their age, gender, and emotion. Once their faces
have been detected, users take a screenshot and upload the image to the site. <br /> <br />

All the images that have been uploaded are displayed on scroll below the cam section. A modal box appears by clicking on each image and users can leave comments. Each image also has a specific url that users can send for reference.<br /><br />
I've automated a regular clean-up of the images in the database with Node Cron.
<br /><br />
Technologies: HTML, CSS, JavaScript, Node with Express.js, PostgreSQL <br />
Library: Vue.js | API: face-api.js | Storage: Cloudinary
