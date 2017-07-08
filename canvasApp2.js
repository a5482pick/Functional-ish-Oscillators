"use strict";

//Initialise all the constants that hold functions.

//Initialise canvas values, and read the initial physical parameters. 
const setupCanvas = (function()  {


    //Ratios used to control canvas size.
    const ratioWidth = 0.79;

    const ratioHeight = 0.075;


    return function()  {


        //Used when window is resized while animation is running.
        sessionStorage.setItem("running","1");               


    	const theCanvas = document.getElementById("canvasOne");


    	//To allow future functions to simulate the pure functional style, we save submitted values now
    	//and will provide them as parameters.
    	const el_k1 =  document.getElementById("k1");
	
    	const el_k2 =  document.getElementById("k2");
	
    	const el_k3 =  document.getElementById("k3");

    	const el_m1 =  document.getElementById("m1");

    	const el_m2 =  document.getElementById("m2");

    	theCanvas.width = window.innerWidth*ratioWidth;
	
    	theCanvas.height = window.innerHeight*ratioHeight;

    	//An array that will collate required parameters.  Each function may append a new object on to
    	//x, but, to simulate immutability, may not alter any other positions on the array. 
    	const x = [];

   	x.push({theCanvas:theCanvas, el_k1:el_k1, el_k2:el_k2, el_k3:el_k3, el_m1:el_m1, el_m2:el_m2, sessionStorage:sessionStorage});

    	return x;      //Position x[0] for setUpCanvas().
    }

})();


//----------------------------------------------------------------------------------


//Set up the initial geometry for the animation.
const theGeometry = (function ()   {


    const initialDisp = 1.0;

    return function (y) {

        
        //Set up the initial displacement.  'a' is the (displacement) amplitude.
        const a = initialDisp / (y[2].eigen1 - y[2].eigen2);    
    
    
        //Allow the difference in masses to be represented on screen by a corresponding difference in sizes.   
        const radiusM1 = 20*Math.pow(y[1].m1,1/3);
        const radiusM2 = 20*Math.pow(y[1].m2,1/3);

        y.push({a:a, radiusM1:radiusM1, radiusM2:radiusM2});

        return y;           //Position x[3] for theGeometry(..).
    }

})();


//--------------------------------------------------------------------------------


//This script retrieves the user's submitted values, then checks validity.  
const checkSubmit = (function()  {


    var k1match, k2match, k3match, m1match, m2match, k1, k2, k3, m1, m2;

    return function (x)    {


    	//A draw request can be from either a user submission or a resizing.  Here we consider new user submitted values.  
        if (x[0].sessionStorage.getItem("resized") !== "1") {
   
            //Test to see if a submitted value contains a non-numeric character after 1 or more numbers.
            k1match = x[0].el_k1.value.match(/^[0-9]+[^0-9\.]+/);
            k2match = x[0].el_k2.value.match(/^[0-9]+[^0-9\.]+/);
            k3match = x[0].el_k3.value.match(/^[0-9]+[^0-9\.]+/);
            m1match = x[0].el_m1.value.match(/^[0-9]+[^0-9\.]+/);
            m2match = x[0].el_m2.value.match(/^[0-9]+[^0-9\.]+/);
      
      
             //Strip away unwanted characters from the submitted input.
            k1 = parseFloat(x[0].el_k1.value);
            k2 = parseFloat(x[0].el_k2.value);
            k3 = parseFloat(x[0].el_k3.value);
            m1 = parseFloat(x[0].el_m1.value);
            m2 = parseFloat(x[0].el_m2.value);
      
      
            //Provide bounds for the possible user inputs.
            if ((k1 > 100 || k1 < 1) || (k2 > 100  || k2 < 1) || (k3 > 100 || k3 < 1) || (m1 > 100 || m1 < 1) || (m2 > 100 || m2 < 1)  || (!k1 || !k2 || !k3 || !m1 || !m2))  {
        
                //A strictly pure function wouldn't allow the external 'alert' operation, but the operation's
                //harmless here because it doesn't permanently mutate external objects. 
                alert("All parameters must be numbers between 1 and 100.");
                reset(); 
            }
      
      
            //If any of the matches were true, proceed, but with a warning.
            if (k1match || k2match || k3match || m1match || m2match)   {
         
                alert("Numeric values are assumed to be the numbers preceding the first non-numeric character.");
            }   
        }  
   
   
        //If the window has been resized while the animation was running, we reuse the previously entered values
        //that we stored in local storage.
        if (x[0].sessionStorage.getItem("resized") == "1") {
   
            x[0].sessionStorage.setItem("resized","0");
            k1 = parseFloat(sessionStorage.getItem("k1"));
            k2 = parseFloat(sessionStorage.getItem("k2"));
            k3 = parseFloat(sessionStorage.getItem("k3"));
            m1 = parseFloat(sessionStorage.getItem("m1"));
            m2 = parseFloat(sessionStorage.getItem("m2"));
        }

    
        x.push({k1:k1, k2:k2, k3:k3, m1:m1, m2:m2});

        return x;                //Position x[1] for checkSubmit(..).
    }

})();


//-------------------------------------------------------------------------------


//This function/script calculates the eigenfrequencies and eigenvectors associated with the two-mass ,three-spring system.
//The 2nd component of the eigenvector is always 1, so only the 1st component of each mass needs to be calculated and returned. 
const eigenstate = (function()  {


    return function (x)  {
  
        //Extract individual values from the passed object for clarity.
  	const k1 = x[1].k1;
    	const k2 = x[1].k2;
    	const k3 = x[1].k3;
    	const m1 = x[1].m1;
    	const m2 = x[1].m2;
    
    	//Calculate the eigenvalues.          
    	const lamdaBlock1 = k1*m2 + k2*m1 + k2*m2 + k3*m1;
    	const lamdaBlock2 = k1*k2*m1*m2 + k1*k3*m1*m2 + k2*k3*m1*m2;
    	const lamdaBlock3 = k1*m2 + k2*m1 + k2*m2 + k3*m1;
      
        const lamdaSQRT = Math.sqrt(Math.pow(lamdaBlock1,2) - 4*lamdaBlock2);
      
        const lamda1 = ((-lamdaSQRT) - lamdaBlock3) / (2*m1*m2);
        const lamda2 = (lamdaSQRT - lamdaBlock3) / (2*m1*m2); 
      
        //The two eigenvalues:
        const omega1 = Math.sqrt(-lamda1);
        const omega2 = Math.sqrt(-lamda2);
   

        //Calculate the eigenvectors.  The 2nd vector component is 1.   
    	const vectorBlock1 = Math.pow(k2*m1 + k3*m1 + k1*m2 + k2*m2,2);
    	const vectorBlock2 = k1*k2*m1*m2 + k1*k3*m1*m2 + k2*k3*m1*m2;
    	const vectorBlock3 = k2*m1 + k3*m1 + k1*m2 + k2*m2;
     
    	var eigen1Temp = 0.5*(vectorBlock3 + Math.sqrt(vectorBlock1 - 4*vectorBlock2));
   	eigen1Temp = -m1*(k2 + k3) + eigen1Temp;
        const eigen1 = (-1/(k2*m1))*eigen1Temp;
      
        var eigen2Temp = 0.5*(vectorBlock3 - Math.sqrt(vectorBlock1 - 4*vectorBlock2));
   	eigen2Temp = -m1*(k2 + k3) + eigen2Temp;
   	const eigen2 = (-1/(k2*m1))*eigen2Temp;

    	//Return eigenfrequencies and eigenvectors:  omega1 = frequency mass1, eigen1 = vector mass1 
   	//omega2 = frequency mass2, eigen2 = vector mass2.  
   	x.push({omega1:omega1, omega2:omega2, eigen1:eigen1, eigen2:eigen2});
    
    	return x;              //Position x[2] for eigenstate(..).
    } 
 
})();   


//-------------------------------------------------------------------------------


//Creates the context, draws the background, and performs iteration over time.
const drawScreen = (function() {  


    var t = 0;
                 
    return function (x)  {
        
        //Iterate over time.
        t =t +0.03;                                    
 
        //Extract the values from the array for clarity.
        const omega1 = x[2].omega1;
        const omega2 = x[2].omega2;
        const eigen1 = x[2].eigen1;
        const eigen2 = x[2].eigen2;

        const context = x[0].theCanvas.getContext("2d");

        const width = x[0].theCanvas.width;
        const height = x[0].theCanvas.height;
        const a = x[3].a;

        //Create the background.
        context.fillStyle ='#EEEEEE';
        context.fillRect(0,0,width,height);
        context.strokeStyle = '#000000';
        context.strokeRect(1,1,width-2,height-2);
        
           
        //x1 and x2 are the displacments of the masses on the left and right respectively, after a time t.
        const x1 = a*eigen1*Math.cos(omega1*t) - a*eigen2*Math.cos(omega2*t); 
        const x2 = a*Math.cos(omega1*t) - a*Math.cos(omega2*t);
      
      
        //The displaced position, adjusted to allow for variable screen size.
        //0.25*width and 0.75*width represent the two balls' canvas positions at zero displacement.
        const x1Draw = x1*0.13636*width + 0.25*width;
        const x2Draw = x2*0.13636*width + 0.75*width;
      

        x[4] = {context:context, x1Draw:x1Draw, x2Draw:x2Draw}; 

        return x;               
    }

})();


//--------------------------------------------------------------------------------


//Calculate and plot spring k1.
const imageData1 = (function() {


    var imgData, xPos, yPos, k1Spring;

    return function (x)   {

   
    	const param = (2*Math.PI*20)/(x[4].x1Draw - x[3].radiusM1); 

      
    	for (var dist = 0; dist < x[4].x1Draw; dist++)  {
     
            
    	    k1Spring = (x[0].theCanvas.height/2)+0.1*x[0].theCanvas.height*Math.sin(param * dist);         
                       
    	    imgData = x[4].context.createImageData(1, 1);

    	    for (var i = 0; i < imgData.data.length; i += 4) {
         
    	        imgData.data[i+0] = 255;
    	        imgData.data[i+1] = 0;
    	        imgData.data[i+2] = 0;
    	        imgData.data[i+3] = 255;
    	    }
             
    	    xPos = dist;
    	    yPos = k1Spring;
 
    	    x[4].context.putImageData(imgData, xPos, yPos);     
    	}
      
    	return x;
    }

})();


//-----------------------------------------------------------------------------------


//Calculate and plot spring k2.
const imageData2 = (function() {


    var imgData, xPos, yPos, k2Spring;

    return function (x)   {


    	const x1Draw = x[4].x1Draw;

    	const x2Draw = x[4].x2Draw;
    
    	const radiusM1 = x[3].radiusM1;

    	const radiusM2 = x[3].radiusM2;

    	const param = (2*Math.PI*40)/((x2Draw-radiusM2)-(x1Draw+radiusM1));


   	for (var dist = 0; dist < (x2Draw+radiusM2)-(x1Draw+radiusM1); dist++)  {
      
            
     	    k2Spring = (x[0].theCanvas.height/2)+0.1*x[0].theCanvas.height*Math.sin(param * dist);         
                     
            imgData = x[4].context.createImageData(1, 1);
           
            for (var i = 0; i < imgData.data.length; i += 4) {
         
            	imgData.data[i+0] = 255;
                imgData.data[i+1] = 0;
            	imgData.data[i+2] = 0;
            	imgData.data[i+3] = 255;
            }
 
            xPos = dist+x1Draw + radiusM1;
            yPos = k2Spring;
 
            x[4].context.putImageData(imgData, xPos, yPos);  
        }  

        return x;  
    }

})();


//------------------------------------------------------------------------------------


//Calculate and plot spring k3.
const imageData3 = (function()  {


    var imgData, xPos, yPos, k3Spring;  

    return function (x)   {


        const x2Draw = x[4].x2Draw;
    
        const radiusM2 = x[3].radiusM2;


        const param = (2*Math.PI*20)/(x[0].theCanvas.width - (x2Draw+radiusM2));

      
        for (var dist = 0; dist < x[0].theCanvas.width - (x2Draw+radiusM2); dist++)  {
            
            
            k3Spring = (x[0].theCanvas.height/2)+0.1*x[0].theCanvas.height*Math.sin(param * dist);         
                     
            imgData = x[4].context.createImageData(1, 1);
         
            for (var i = 0; i < imgData.data.length; i += 4) {
         
            	imgData.data[i+0] = 255;
           	imgData.data[i+1] = 0;
           	imgData.data[i+2] = 0;
           	imgData.data[i+3] = 255;
            }

            xPos = dist+x2Draw + radiusM2;
            yPos = k3Spring;
 
            x[4].context.putImageData(imgData, xPos, yPos);
        }

        return x;
    }
     
})();    


//------------------------------------------------------------------------------------


//Add the masses to the animation.
const drawMasses = (function()   {


    return function (x)   {


        const context = x[4].context;

        const x1Draw = x[4].x1Draw;
    
        const x2Draw = x[4].x2Draw;

        const radiusM1 = x[3].radiusM1;

        const radiusM2 = x[3].radiusM2;

        const width = x[0].theCanvas.width;

        const height = x[0].theCanvas.height;


        //Draw mass 1.
        context.beginPath();
        context.arc(x1Draw,height/2,radiusM1,0,2*Math.PI);
        context.fillStyle="#000000";
        context.fill();
        context.closePath();
    
        context.font = "20px serif";
        context.fillStyle = "#FFFFFF";
        context.fillText("1",x1Draw-6,(height/2)+6);
      
        //Draw mass 2.
        context.beginPath();
        context.arc(x2Draw,height/2,radiusM2,0,2*Math.PI);
        context.fillStyle="#000000";
        context.fill();
        context.closePath();   
    
        context.font = "20px serif";
        context.fillStyle = "#FFFFFF";
        context.fillText("2",x2Draw-6,(height/2)+6);  

        return x;
    }

})();


//Listening for both window 'loading' and window 'resizing'.
window.addEventListener("resize",resized,false);
window.addEventListener("load",begin,false);


//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------


//This function is called when either the window loads or when location.reload() is applied as a result of resizing.
function begin () {
     

    //We listen for'start' being clicked. 
    document.getElementById("start").addEventListener("click", entry, false);

    //When 'reset' is pressed, set 'running' to 0.
    document.getElementById("stop").addEventListener("click",reset,false);
   

    //This block is used when 'begin()' is called as a response to a 'resize' event, and when the animation is 'running'.
    //Local storage has remembered the previous parameters, and we automatically commence animation with these values.
    if (sessionStorage.getItem("resized") ==="1" && sessionStorage.getItem("running") === "1") {
    
        document.getElementById("k1").value = sessionStorage.getItem("k1");
        document.getElementById("k2").value = sessionStorage.getItem("k2");
        document.getElementById("k3").value = sessionStorage.getItem("k3");
        document.getElementById("m1").value = sessionStorage.getItem("m1");
        document.getElementById("m2").value = sessionStorage.getItem("m2");
        
        //Call entry() to start the animation automatically.
        entry();
    }

    //When resized but 'running' is not "1" don't do anything.
}


//--------------------------------------------------------------------------------


//This function is called when the window is resized.  We use sessionStorage to 'remember' that a
//resizing event, not a new session, has occurred.
function resized () { 
   
    sessionStorage.setItem("resized","1");

    //Set the values so that the animation is able to restart automatically.
    sessionStorage.setItem("k1", document.getElementById("k1").value);
    sessionStorage.setItem("k2", document.getElementById("k2").value);
    sessionStorage.setItem("k3", document.getElementById("k3").value);
    sessionStorage.setItem("m1", document.getElementById("m1").value);
    sessionStorage.setItem("m2", document.getElementById("m2").value);
  
    //(Firefox needs this to ensure automatic resizing when reloading.)
    window.location.href = window.location.href;

    location.reload();
}


//---------------------------------------------------------------------------------


//We stop and clear any animation when the reset button is pressed.
function reset () {
   
    location.reload();
   
    //Set the last known state to 'not running'. 
    sessionStorage.setItem("running","0");
}


//----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------


//Perform the initial, pre-animation calculations.  Then pass the 'value' that results 
//from those calculations to 'runAnimation'.
function entry() {


    runAnimation( theGeometry( eigenstate( checkSubmit( setupCanvas( ) ) ) ) );
}


//---------------------------------------------------------------------------------


//'runAnimation' controls the time evolution of the animation, given the initial conditions
//encapsulated in value 'x'.
function runAnimation(x)  {

     setInterval(display,20,x);


     function display(x)  {

          drawMasses( imageData3( imageData2( imageData1( drawScreen( x ) ) ) ) ) ;                                          
    }
}


//----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------



