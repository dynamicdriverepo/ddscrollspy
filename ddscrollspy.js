/*
* DD ScrollSpy Menu Script (c) Dynamic Drive (www.dynamicdrive.com)
* Last updated: Dec 28, 12'
* Visit http://www.dynamicdrive.com/ for this script and 100s more.
*/

if (!Array.prototype.filter){
  Array.prototype.filter = function(fun /*, thisp */){
    "use strict";
 
    if (this == null)
      throw new TypeError();
 
    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();
 
    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++){
      if (i in t){
        var val = t[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, t))
          res.push(val);
      }
    }
 
    return res;
  };
}

(function($){

	var defaults = {
		spytarget: window,
		scrolltopoffset: 0,
		scrollbehavior: 'smooth',
		scrollduration: 500,
		highlightclass: 'selected',
		mincontentheight: 30
	}

	function inrange(range, field){ // check if "playing field" is inside range
		var rangespan = range[1]-range[0], fieldspan = field[1]-field[0]
		if ( (range[0]-field[0]) >= 0 && (range[0]-field[0]) < fieldspan ) // if top of range is on field
			return true
		else{
			if ( (range[0]-field[0]) <= 0 && (range[0]+rangespan) > field[0] ) // if part of range overlaps field
				return true
		}
		return false
	}

	$.fn.ddscrollSpy = function(options){
		var $window = $(window)
		var $body=(window.opera)? (document.compatMode=="CSS1Compat"? $('html') : $('body')) : $('html,body')

		return this.each(function(){
			var o = $.extend({}, defaults, options)
			var targets = [], $currenttarget = ''
			var $spytarget = $( o.spytarget ).eq(0)
			var $menu = $(this)

			function spyonmenuitems($menu){
				var $menuitems = $menu.find('a[href^="#"]')
				targets = []
				$currenttarget = ''
				$menuitems.each(function(i){
					var $item = $(this)
					var $target = $( $item.attr('href') )
					var target = $target.get(0)
					if ($target.length == 0) // if no matching links found
						return true
					$item
						.off('click.goto')
						.on('click.goto', function(e){
							if ( o.spytarget == window && (o.scrollbehavior == 'jump' || !history.pushState))
								window.location.hash = $item.attr('href')
							if (o.scrollbehavior == 'smooth' || o.scrolltopoffset !=0){
								var $scrollparent = (o.spytarget == window)? $body : $spytarget
								var iefixoffset = (document.all && !window.Worker) ? 1 : 0 // in IE9 and below, add 1px to final scroll position to account for strange bug
								if (o.scrollbehavior == 'smooth' && (history.pushState || o.spytarget != window)){
									$scrollparent.animate( {scrollTop: targets[i].offsettop + iefixoffset}, o.scrollduration, function(){
										if (o.spytarget == window && history.pushState){
											history.pushState(null, null, $item.attr('href'))
										}
									})
								}
								else{
									$scrollparent.prop('scrollTop', targets[i].offsettop + iefixoffset)
								}
								e.preventDefault()
							}
						})
					var targetoffset = (o.spytarget == window)? $target.offset().top : (target.offsetParent == o.spytarget)? target.offsetTop : target.offsetTop - o.spytarget.offsetTop
					targetoffset +=  o.scrolltopoffset
					var targetheight = ( parseInt($target.data('spyrange')) > 0 )? parseInt($target.data('spyrange')) : ( $target.outerHeight() || o.mincontentheight)
					targets.push( {$menuitem: $item, $des: $target, offsettop: targetoffset, height: targetheight} )
				})
			}

			function highlightitem(){
				if ($currenttarget.length == 1) // if there was a previously selected menu link
					$currenttarget.removeClass(o.highlightclass)
				var scrolltop = $spytarget.scrollTop()
				var $spyheight = $spytarget.outerHeight()
				var shortlist = targets.filter(function(el, index){ // filter target elements that are currently visible on screen
					return inrange([el.offsettop, el.offsettop + el.height], [scrolltop, scrolltop + $spyheight])
				})
				if (shortlist.length > 0){
					$currenttarget = shortlist.shift().$menuitem.addClass(o.highlightclass) // select the first element that's visible on screen and highlight its menu item
				}
			}

			function updatetargetpos(){
				var $menu = targets[0].$menu
				for (var i = 0; i < targets.length; i++){
					var $target = targets[i].$des
					var target = $target.get(0)
					var targetoffset = (o.spytarget == window)? $target.offset().top : (target.offsetParent == o.spytarget)? target.offsetTop : target.offsetTop - o.spytarget.offsetTop
					targetoffset += o.scrolltopoffset
					targets[i].offsettop = targetoffset
					targets[i].height = ( parseInt($target.data('spyrange')) > 0 )? parseInt($target.data('spyrange')) : ( $target.outerHeight() || o.mincontentheight)
				}
			}

			spyonmenuitems($menu)

			$menu.on('updatespy', function(){
				spyonmenuitems($menu)
				highlightitem()
			})

			$spytarget.on('scroll resize', function(){
				highlightitem()
			})
			highlightitem()

			$window.on('load', function(){
				updatetargetpos()
			})
		}) // end return
	}

})(jQuery);