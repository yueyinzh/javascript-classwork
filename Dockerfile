# Use the official Node.js 23 image from Amazon ECR Public Gallery
FROM public.ecr.aws/docker/library/node:23

WORKDIR /app

# The course checker clones the public repository, runs this Dockerfile, and
# expects the image to contain the same project that was pushed to GitHub.
RUN git clone https://github.com/yueyinzh/javascript-classwork.git .

ENTRYPOINT ["node", "src/index.js"]
