(function() {
  //modal
  Vue.component("modal-component", {
    template: "#modal-component",
    props: ["id"],
    data: function() {
      return {
        image: {
          title: "",
          description: "",
          url: "",
          id: null
        },
        comments: [],
        newComment: {
          comment: "",
          username: ""
        },
        error: false
      };
    },
    mounted: function() {
      var me = this;

      axios
        .get(`/images/${this.id}`)
        .then(function(response) {
          me.image = response.data[0];
        })
        .catch(function(error) {
          console.log("error inside watch for id", error);
        });

      axios
        .get(`/comment/${this.id}`)
        .then(function(response) {
          me.comments = response.data;
        })
        .catch(function(error) {
          console.log("error inside get comments for image", error);
        });
    },
    watch: {
      //track props id's change
      id: function() {
        var me = this;
        axios
          .get(`/images/${this.id}`)
          .then(function(response) {
            me.image = response.data[0];
          })
          .catch(function(error) {
            console.log("error inside watch for id", error);
          });
      }
    },
    methods: {
      closeModal: function() {
        //emit to tell the instance to close the modal
        this.$emit("changingid-close");
        location.hash = "";
      },
      sendingComment: function(e) {
        var me = this;

        e.preventDefault();

        if (
          me.newComment.username.length === 0 ||
          me.newComment.comment.length === 0
        ) {
          return (this.error = true);
        }

        let commentInfo = {
          username: me.newComment.username,
          comment: me.newComment.comment,
          image_id: me.id
        };

        axios
          .post(`/comment/sendComments`, commentInfo)
          .then(function(response) {
            me.error = false;
            me.newComment.username = "";
            me.newComment.comment = "";
            me.comments.unshift(response.data);
          })
          .catch(function(error) {
            return (me.error = true);
          });
      }
    }
  });
  //info box
  Vue.component("info-component", {
    template: "#info-component",
    data: function() {
      return {};
    },
    mounted: function() {},
    methods: {
      closeinfo: function() {
        this.$emit("closeinfo");
      }
    }
  });
  //main: cam and images
  new Vue({
    el: "#main",
    data: {
      id: location.hash.slice(1),
      guidelines: true,
      showingMore: true,
      lowestId: "",
      cutoff: "",
      images: [],
      title: "",
      description: "",
      username: "",
      file: null,
      info: false,
      error: false,
      success: false
    },
    mounted: function() {
      ///FACE API STARTS HERE ////
      const video = document.getElementById("video");

      //getting models for face detection
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.ageGenderNet.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models")
      ]).then(startVideo);

      //connect videocam to browser
      function startVideo() {
        navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: false
          })
          .then(cameraStream => {
            video.srcObject = cameraStream;
          });
      }

      // draw face detection canvas on videocam play
      video.addEventListener("play", function() {
        const canvas = faceapi.createCanvasFromMedia(video);

        //fixing bug of canvas being appended several times
        if (!document.body.contains(document.querySelector("canvas"))) {
          document.body.append(canvas);
        }

        const displaySize = {
          width: video.width,
          height: video.height
        };

        faceapi.matchDimensions(canvas, displaySize);
        setInterval(async () => {
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();
          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );
          canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
          resizedDetections.forEach(detection => {
            const box = detection.detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, {
              label: Math.round(detection.age) + " year old " + detection.gender
            });
            drawBox.draw(canvas);
          });
        }, 100);
      });
      ///FACE API ENDS HERE////

      //get images added to the imageboard
      var me = this;
      axios
        .get("/images")
        .then(function(response) {
          me.images = response.data.rows;

          //hide more button if one the images on screen has id equal to 1
          for (let i = 0; i < me.images.length; i++) {
            if (me.images[i].id === 1) {
              me.showingMore = false;
            }
          }
        })
        .catch(error =>
          console.log("error in get images - vue instance", error)
        );

      //slice the location.hash to get the number of the hash
      window.addEventListener("hashchange", function() {
        me.id = location.hash.slice(1);
      });
    },
    methods: {
      submitFile: function(e) {
        e.preventDefault();

        var fomData = new FormData();
        fomData.append("title", this.title);
        fomData.append("description", this.description);
        fomData.append("username", this.username);
        fomData.append("file", this.file);

        if (
          this.title.length === 0 ||
          this.description.length === 0 ||
          this.username.length === 0 ||
          !this.file
        ) {
          this.error = true;
          return;
        }

        var me = this;

        axios
          .post("/upload", fomData)
          .then(function({ data }) {
            if (data.error) {
              console.log("error", data.error);
              return (me.error = true);
            } else {
              me.error = false;
              me.success = true;
              me.title = "";
              me.description = "";
              me.username = "";
              me.images.unshift(data);

              setTimeout(() => {
                me.success = false;
              }, 3000);
            }
          })
          .catch(function(error) {
            console.log("error", error);
            me.error = true;
            return;
          });
      },
      uploading: function(e) {
        this.file = e.target.files[0];
      },
      closemodal: function() {
        var me = this;
        me.id = history.replaceState(null, null, " ");
      },
      openinfo: function() {
        this.info = true;
      },
      closeinfo: function() {
        this.info = false;
      },
      closeguidelines: function() {
        this.guidelines = false;
      },
      clickMore: function(images) {
        this.images = images;

        //lowestId: lowest id in the database
        //cutoff: lowest id on screen
        let idList = [];
        let cutoff = "";
        for (let i = 0; i < this.images.length; i++) {
          idList.push(this.images[i].id);
        }

        idList.sort(function(a, b) {
          return a - b;
        });

        cutoff = Math.min.apply(Math, idList);

        var me = this;

        axios
          .get(`/pagination/${cutoff}`)
          .then(function({ data }) {
            let merging = images.concat(data);
            me.images = merging;

            //hide the more button if one of the images' id
            //matches the lowest id in the database(=last image)
            for (let i = 0; i < me.images.length; i++) {
              if (me.images[i].id === me.images[i].lowestId) {
                me.showingMore = false;
              }
            }
          })
          .catch(function(error) {
            console.log("error in pagination cutoff", error);
          });
      }
    }
  });
})();
