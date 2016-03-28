console.log("starting cluster ...");

var cluster   = require('cluster');
var os        = require('os');
var cpuNumber = os.cpus().length;
cpuNumber = 2;

if(cluster.isMaster) {
  var workerIndex = 0;
  
  for(workerIndex = 0; workerIndex < cpuNumber; workerIndex++) {
    cluster.fork(); 
  }  
  
  Object.keys(cluster.workers).forEach(function(id) {
    console.log("worker server started with process id: " + cluster.workers[id].process.pid);  
  });
  
  cluster.on('exit', function(worker, code, signal) {
    console.log("worker server " + worker.process.pid + " died" );
    cluster.fork();
  });
  
  
}
else {
  require('./server.js');
}