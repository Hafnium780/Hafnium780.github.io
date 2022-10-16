Created with React js and jquery. 

## Graph Structure
At first, I stored the graph in the form of an adjacency list, with each node storing the index of each edge connected. I quickly ran into problems when trying to delete parts, however, because all the indices would need to be shifted for the ordering to stay the same. To fix this, I turned to using circular references, where each component would store the other components connected to it, and indices would be calculated when needed.

## Graph Layout
My initial idea was to use rotated and positioned divs to show all nodes and edges, but this lead to many problems. Unless I created images, the only edges that could be drawn were straight ones. The rendering was slightly delayed, making dragging nodes around feel very awkward. Switching to using SVG’s fixed these problems, even simplifying the code in some places.

For this to be a somewhat realistic-looking graph, I want the weights to correspond to lengths of the edges. However, if the graph were completely rigid, it would become impossible to calculate a valid geometry with the given weights. The solution to this is to make the graph dynamic, with each edge acting like a spring with unstretched length proportional to its weight. That way, a close enough representation can be created. This also means that if there is no solution (ex. a triangle with side lengths 1, 1, and 20), the closest thing would be shown, making handling these impossible situations trivial. I also added an option to randomly assign weights to make testing easier.

To drag nodes around, I tried using jquery’s draggable function, but it was hard to control and didn’t work well with SVGs, so I switched to listening for mouse events. 

## Camera
I didn’t plan on making the camera movable, but I realized there often wasn’t that much space to work with. Expanding the code for dragging nodes, I let the board get dragged and updated the camera’s position with it. Removing constraints that prevented nodes from moving outside the board, I instead made it so nodes and edges outside of the board didn’t get rendered.

I added the two buttons on the bottom left, then decided to make the motion more smooth instead of jumping from place to place, by interpolating over some time to make the camera glide over.

## Context Menu
In order to change the edges’ weights and the start/end node, I initially had a selection section at the bottom of the menu that would display what was last clicked. It was inconvenient to have to look back and forth between the graph and the side menu, and it was taking up a lot of space. I opted to instead make a small context menu whenever a node or edge was right clicked, making it much better.

## Menu
The menu is probably the part I most consistently changed. I put all the buttons on one tab at first, then eventually spread them out when they simply couldn’t fit anymore.

## Builder
There isn’t much to say about the builder tab - you click a button and it tells the board, which reacts accordingly. Making the graph directed was a bit difficult though; I reconstructed the graph entirely every time to make it simpler.

## Algorithms
When an algorithm is selected and run, an asynchronous function for that algorithm is called, with an update function as well as a reference to a delay object passed in. Whenever the algorithm does something (visits a node/edge, adds an edge to the tree, etc.), the update function can be called and the graph would update. The animation for edges was done by offsetting the stroke and transitioning back, making it seem like the edge is filling in. Because the delay is passed by reference and not value, updating the algorithm step time allowed the algorithm to speed up or slow down at any time. If the user did anything that caused the graph to change, the algorithm could be immediately stopped by changing the delay object to tell it to return.

## Text
Exporting the graph as text turned out to be pretty easy, even after changing from indices to references. Get the number of nodes and edges, and for every edge get the indices of the nodes it is connected to. Importing was also simple, since I already had the code for adding nodes and edges.

## Saving
The graph is autosaved with an interval. Instead of trying to convert the graph into a JSON, I could use the existing code for converting the graph to text, save that, and then load it when the page is reloaded.
