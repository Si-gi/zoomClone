import interact from 
'https://cdn.jsdelivr.net/npm/@interactjs/interactjs/index.js'

const default_width = $('#sidebar')[0].getBoundingClientRect().width;
const default_height = $('#sidebar')[0].getBoundingClientRect().height;
interact('#sidebar')
  .resizable({
  // resize from all edges and corners
    edges: { left: true, right: false, bottom: false, top: false },

    listeners: {
      move (event) {
        var target = event.target
        let mainSide = $('.main__left')
        var x = (parseFloat(target.getAttribute('data-x')) || 0)
        var y = (parseFloat(target.getAttribute('data-y')) || 0)

        var main_x = (parseFloat(target.getAttribute('data-x')) || 0)
        var main_y = (parseFloat(target.getAttribute('data-y')) || 0)


        // update the element's style
        target.style.width = event.rect.width + 'px'
        //$('.main__left')[0].style.width -= event.rect.width + 'px';
        // translate when resizing from top or left edges
        //x += event.deltaRect.left
        //y += event.deltaRect.top
        if(default_width > event.rect.width){
          console.log("default width")
          $('#chat_screen')[0].style.display = "none";
          $('#chat_input')[0].style.display = "none";
          $('#chat_header')[0].style.display = "none";
        }else if($('#chat_screen')[0].style.display == "none"){
          $('#chat_screen')[0].style.display = "flex";
          $('#chat_input')[0].style.display = "flex";
          $('#chat_header')[0].style.display = "flex";
        }

        target.setAttribute('data-x', x)
      //target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height)
      }
    },
    modifiers: [
        // keep the edges inside the parent
        interact.modifiers.restrictEdges({
          outer: 'parent'
        }),
        // minimum size
        interact.modifiers.restrictSize({
          min: {width:15,height: default_height }
        })
    ],
  inertia: true
})