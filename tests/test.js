// Start
/*function f() {  
  "compiled";
  var x = 1;
  for (var i=0;i<8;i++) {
    x = x * 1.5;
  }
  return x;
}*/
/*function f() {  
 "compiled";
 for (var y=0;y<32;y++) {
  line="";
  for (var x=0;x<32;x++) {
    var Xr=0;
    var Xi=0;
    var Cr=(4.0*x/32)-2.0;
    var Ci=(4.0*y/32)-2.0;
    var i=0;
    while ((i<8) && ((Xr*Xr+Xi*Xi)<4)) {
      var t=Xr*Xr - Xi*Xi + Cr;
      Xi=2*Xr*Xi+Ci;
      Xr=t;
      i++;
    }
    if (i&1)
	line += "*";
    else
        line += " ";
   }
   print(line);
 }
}*/
function f(e) {
  "compiled";
  /*var d=e.time-e.lastTime;
  if (d>0.0005 && d<0.0013) n+=d>0.0008?1:0;
  else{
    n="";
  }
  if (n.length==10)  parseRx(n);*/
  return e.time;
}

// End
