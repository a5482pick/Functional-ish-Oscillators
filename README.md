Repo. 'Coupled-Oscillators-Analytic' has been rewritten in a manner that moves a step towards a more functional-ish programming style: For example the style could enable functions, rather than pre-evaluated objects, to be both returned and received as parameters... see in particular functions _imageData2(f)_ and _imageData3(f)_ in file _canvasApp.js_. 

_canvasApp2.js_ is an alternative representation of _canvasApp.js_ that utilises e.g. IIFEs. &nbsp; In particular it demonstrates a slightly different way to perform the iteration over time.

Constructing immutable objects is messy in javascript, so the script has been written with the _pretence_ that objects from external sources are immutable:  The passed parameter _x_ is an array of objects, and each function is allocated its own unique position on that array... the function can access other positions on the array to read them, but pretends it can only mutate its own allocated spot.

The script plays loose with a few simple output operations: for example, function _checkSubmit(..)_ can issue alerts and can mutate 'sessionStorage' in unusual circumstances... and output to and mutation of the canvas is required to draw on it.




--------------------------------------------------------------------------------------------------------------------


**Summary of Operation**



_The animation in canvasApp.js is controlled by_:

<code>setInterval(h,20,g());</code>

_where parameter t is periodically incremented in:_

<code>function h(x)  {drawMasses( imageData3( imageData2( imageData1( drawScreen( x, t ) ) ) ) );}</code>

_and:_

<code>function g()  { return theGeometry( eigenstate( checkSubmit( setUpCanvas( ) ) ) );}</code>


i.e. the animation is updated by _'h(x)'_ every (say) 20 ms, after having received the initial conditions provided by _'g()'_. 

