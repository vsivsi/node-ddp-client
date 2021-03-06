var DDPClient = require("../lib/ddp-client");

var ddpclient = new DDPClient({
  host: "localhost", 
  port: 3000,
  /* optional: */
  auto_reconnect: true,
  auto_reconnect_timer: 500,
  use_ejson: true,           // Use Meteor's EJSON to preserve certain data types.
  use_ssl: false,            
  maintain_collections: true // Set to false to maintain your own collections.
});

/*
 * Connect to the Meteor Server
 */
ddpclient.connect(function(error) {
  if (error) {
    console.log('DDP connection error!');
    return;
  }

  console.log('connected!');

  /*
   * Uncomment to log in with username/password
   */
  // ddpclient.loginWithUsername("username", "password", function (err, result) {
    // result contains your auth token

    setTimeout(function () {
      /*
       * Call a Meteor Method
       */
      ddpclient.call(
        'deletePosts',             // name of Meteor Method being called
        ['foo', 'bar'],            // parameters to send to Meteor Method
        function (err, result) {   // callback which returns the method call results
          console.log('called function, result: ' + result);
        },
        function () {              // callback which fires when server has finished 
          console.log('updated');  // sending any updated documents as a result of
          console.log(ddpclient.collections.posts);  // calling this method 
        }                          
      );
    }, 3000);

    /*
     * Call a Meteor Method while passing in a random seed. 
     * Added in DDP pre2, the random seed will be used on the server to generate
     * repeatable IDs. This allows the same id to be generated on the client and server
     */
    var Random = require("ddp-random"),
        random = Random.createWithSeeds("randomSeed");  // seed an id generator

    ddpclient.callWithRandomSeed(
      'createPost',              // name of Meteor Method being called
      [{ _id : random.id(),      // generate the id on the client 
        body : "asdf" }],            
      "randomSeed",              // pass the same seed to the server
      function (err, result) {   // callback which returns the method call results
        console.log('called function, result: ' + result);
      },
      function () {              // callback which fires when server has finished 
        console.log('updated');  // sending any updated documents as a result of
        console.log(ddpclient.collections.posts);  // calling this method 
      }                          
    );

    /*
     * Subscribe to a Meteor Collection
     */
    ddpclient.subscribe(
      'posts',                  // name of Meteor Publish function to subscribe to
      [],                       // any parameters used by the Publish function
      function () {             // callback when the subscription is complete
        console.log('posts complete:');
        console.log(ddpclient.collections.posts);
      }
    );
  // });
});

/*
 * Useful for debugging and learning the ddp protocol
 */
ddpclient.on('message', function (msg) {
  console.log("ddp message: " + msg);
});

/* 
 * If you need to do something specific on close or errors.
 * You can also disable auto_reconnect and 
 * call ddpclient.connect() when you are ready to re-connect.
*/
ddpclient.on('socket-close', function(code, message) {
  console.log("Close: %s %s", code, message);
});

ddpclient.on('socket-error', function(error) {
  console.log("Error: %j", error);
});
