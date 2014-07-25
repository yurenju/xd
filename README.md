# XD 


## Usage

### Setup

1. install [node.js](http://www.nodejs.org)

2. Install useful command-line tools globally:

        $ npm install -g grunt-cli bower karma

   To fetch dependent packages, enter the webapplate folder and run

        $ git submodule
        $ npm install

### Develop Hosted webapp(With dynamic/static web Server)

    $ grunt static

### deploy to github page

    $ grunt gh-pages

### JavaScript lint check and generate document

    $ grunt docs
