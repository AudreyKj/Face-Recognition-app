# Face-dectection app

Vue.js app using the face recognition API [face-api.js](https://github.com/justadudewhohacks/face-api.js).

Users' webcams are connected to the site and their faces are automatically detected by the API.
The API indicates users' age, gender, and emotion. Users take a screenshot and upload the image to the site.

The images that have been uploaded are displayed on scroll below the cam section. A modal box appears by clicking on each image and users can leave comments. Each image also has a specific url that users can send for reference.

I've automated a regular clean-up of the images in the database with Node Cron to prevent overflow.

[visit live app](https://face-face-face.herokuapp.com/)

## Features

- face-detection API on users' cam
- uploading of images
- browse of image gallery
- comment on images

## Tech

**Stack**: HTML, CSS, JavaScript, Node with Express.js, PostgreSQL <br />
**Framework**: Vue.js | **Storage**: Cloudinary | **Deployment**: Heroku

## Future improvements

- Improve uploading of images with automatic screenshot of the canvas

## Design - color palette

<p align="center">
<img width="150" height="250" src="palette.jpg">
<p align="center">
dark grey, #808080 </br>
grey, #989898 </br>
light grey, #b3b3b3 </br>
blue, #0000ff </br>
</p>
</p>

## Visuals

![screenshot 1](screenshot_imageboard-1.png)
