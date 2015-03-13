/*!
 * mobile slider
 * https://github.com/zxdong262/mobile-slider
 * License: MIT
 */

;(function($){
	function MS(opts, ob) {
		var defaults = {
			speed: 500
			,timer: 4000
			,autoSlider: true
			,hasNav: true
			,pauseOnHover: true
			,navLeftTxt: '&lt;'
			,navRightTxt: '&gt;'
			,zIndex:20
			,ease: 'linear'
			,beforeAction: null
			,afterAction: null
		}
		,th = this
		,defs = th.defs = $.extend(defaults, opts)
		,cssSet = {
			position:'absolute'
			,left:0
			,right:0
			,width:'100%'
			,height:'100%'
			,'z-index': defs.zIndex
		}
		th.t = ob.show().wrapInner('<div class="paper-slides" />')
		th.p = th.t.children().css(cssSet)
		th.ps = th.p.children().addClass('paper-slide').css(cssSet)
		th.len = th.ps.length
		th.flag = null
		th.pause = false
		th.onAction = false
		th.currentPage = 0

		//init z-index
		th.ps.eq(0).css('z-index', defs.zIndex + 1).end().filter(':odd').addClass('ps-odd')
		
		//auto start
		if(th.defs.autoSlider) {
			th.flag = setTimeout(function() {
				th.autoroll()
			}, defs.timer)
		}
		
		//OnHover
		th.t.hover(function() {
			$(this).addClass('ps-hover')
			if(defs.pauseOnHover) th.pause = true
		},function() {
			$(this).removeClass('ps-hover')
			if(defs.pauseOnHover) th.pause = false
		})
		
		//paper link
		th.t.on('click', '.ps-link', function() {
			if(th.onAction) return
			th.onAction = true
			var i1 = parseInt($(this).data('ps-page'))
			,i2 = (i1 + th.len) % th.len
			,isNext = i1 > th.currentPage
			if(i2 === th.currentPage) return
			th.action(isNext, i2)
		})
		
		//navs
		if(defs.hasNav) {
			th.t.append('<a href="javascript:;" class="ps-nav ps-nav-prev">' + defs.navLeftTxt +
			'</a><a href="javascript:;" class="ps-nav ps-nav-next">' + defs.navRightTxt + '</a>')
			.children('.ps-nav').css('z-index', defs.zIndex + 10 + th.len)
			th.t.on('click', '.ps-nav', function() {
				if(th.onAction) return
				th.onAction = true
				var isNext = $(this).hasClass('ps-nav-next')
				,len = th.len
				,i = isNext? (th.currentPage + 1 + len) % len : (th.currentPage - 1 + len) % len 
				th.action(isNext, i)
			})
		}
	}
	
	PS.prototype = {
		action: function(isNext,index) {
			var th = this
			,defs = th.defs
			,speed = defs.speed
			,c = th.currentPage
			,ps = th.ps
			,step = isNext?50 : -50
			,cp = ps.eq(c)
			,ip = ps.eq(index)
			cp.css({
				'z-index': defs.zIndex + 2
			}).addClass('ps-on').show()
			ip.css({
				'z-index': defs.zIndex + 1
			}).addClass('ps-on').show()
			ps.filter(function() {
				return !$(this).hasClass('ps-on')
			}).css('z-index', defs.zIndex)
			$.isFunction(th.defs.beforeAction) && th.defs.beforeAction.call(th)
			cp.animate({
				left: -step + '%'
			}, speed, defs.ease, function() {
				cp.css('z-index', defs.zIndex + 1).animate({
					left:0
				},speed)
			});
			ip.animate({
				left:step
			}, speed, defs.ease, function() {
				cp.removeClass('ps-on')
				ip.css('z-index', defs.zIndex + 2).removeClass('ps-on').animate({
					left:0
				}, speed)
				th.currentPage = index
				th.onAction = false
				$.isFunction(th.defs.afterAction) && th.defs.afterAction.call(th)
				if(defs.autoSlider) {
					clearTimeout(th.flag)
					th.flag = setTimeout(function() {
						th.autoroll()
					}, defs.timer)
				}
			})
		}
		,autoroll: function() {
			var t = this
			if(!t.onAction && !t.pause) {
					t.onAction = true
					var i = (t.currentPage + 1 + t.len) % t.len
					if(!t.pause) t.action(true,i)
			}
			else {
				clearTimeout(t.flag)
				t.flag = setTimeout(function() {
					t.autoroll()
				}, t.defs.timer)
			}
		}
		,destroy: function() {
			var t = this
			clearTimeout(t.flag)
			t.ps.unwrap()
			t.t.off( 'click', '**' ).removeAttr('style').children('.ps-nav').remove()
			t.t.children('.paper-slide').removeAttr('style').removeClass('paper-slide')
			$.each( t, function( key, value ) {
				delete t[key]
			})
		}
		
	}
	
	//jquery plugin
	$.fn.paperSlider = function(opts) {
		return new PS(opts, this)
		}
})(jQuery)


/*!
 * ds.js https://github.com/zxdong262/dialog-system
 */

;(function(window, undefined) {


	//for seajs
	if ( typeof define === 'function' ) {
		define( function(require, exports) {
			factory(require('jquery'))
		})
	}

	//for direct use
	else factory(jQuery)

	//factory
	function factory($) {

	}

	function MS(_opts, _$obj) {
		var 
		defaults = {
			speed: 1000 //animation time
			,timer: 4000 //time stops between auto roll
			,autoSlider: true
			,hasNav: true //show nav buttons
			,navEvent: true //click tap nav button trigger slider
			,swipeEvent: true //swipe trigger slider
			,hasVerticalTopNav: false //show vertical slider top nav button
			,navLeftHtml: '&laquo;' //left nav button html
			,navRightHtml: '&raquo;' //right nav button html
			,navTopHtml: '&or;' //top nav button html
			,navbottomHtml: '&and;' //bottom nav button html
			,zIndex:20 //base index
			,ease: 'linear'
			,beforeAction: null //callback before slider fires, param ms(MS instance)
			,afterAction: null //callback fater slider finish. param ms(MS instance)
			,startIndex: 0 //start from index
			,vertical: true //is vertical slider
		}
		,opts = _opts
		,$obj = _$obj
		,th = this
		,defs = th.defs = $.extend(defaults, opts)
		,cssSet = {
			position:'absolute'
			,left:0
			,right:0
			,width:'100%'
			,height:'100%'
			,'z-index': defs.zIndex
		}
		th.$wrap = $obj
		th.$wrap.addClass(def.vertical?'ms-vertical':'' + hasVerticalTopNav?'':'ms-hide-top-nav')
		th.$sliderItems = th.$wrap.children().addClass('ms-slider').css(cssSet)
		th.length = th.$sliderItems.length
		th.timerhandler = null //autoslider timer hanler
		th.pause = false
		th.onAction = false
		th.currentPage = defs.startIndex

		//init z-index
		th.$sliderItems.css('z-index', defs.zIndex)
		.eq(0).css('z-index', defs.zIndex + 1)

		//add class ms-odd to odd element
		th.$sliderItems.filter(function(index) {
			return index % 2
		}).addClass('ms-odd')
		
		//auto start
		if(th.defs.autoSlider) {
			th.timerhandler = setTimeout(function() {
				th.autoroll()
			}, defs.timer)
		}

		//nav button
		if(defs.hasNav) {
			th.$wrap.append('<i class="ms-nav ms-nav-prev">' + defs.vertical?defs.navTopHtml:defs.navLeftHtml +
			'</i><a href="javascript:;" class="ms-nav ms-nav-next">' + defs.vertical?defs.navBottomHtml:defs.navRightHtml + '</a>')
			.children('.ms-nav').css('z-index', defs.zIndex + 10 + th.length)
			if(defs.navEvent) th.$wrap.on('click tap', '.ms-nav', function() {
				if(th.onAction) return
				th.onAction = true
				var isNext = $(this).hasClass('ms-nav-next')
				,len = th.length
				,i = isNext? (th.currentPage + 1 + len) % len : (th.currentPage - 1 + len) % len 
				th.action(isNext, i)
			})
		}

		//swipe event
		if(defs.swipeEvent) {

			if(defs.vertical) {
				th.$wrap.swipeUp(function() {
					if(th.onAction) return
					th.onAction = true
					var isNext = true
					,len = th.length
					,i = isNext? (th.currentPage + 1 + len) % len : (th.currentPage - 1 + len) % len 
					th.action(isNext, i)
				})
				th.$wrap.swipeDown(function() {
					if(th.onAction) return
					th.onAction = true
					var isNext = false
					,len = th.length
					,i = isNext? (th.currentPage + 1 + len) % len : (th.currentPage - 1 + len) % len 
					th.action(isNext, i)
				})
			}
			else {
				th.$wrap.swipeLeft(function() {
					if(th.onAction) return
					th.onAction = true
					var isNext = true
					,len = th.length
					,i = isNext? (th.currentPage + 1 + len) % len : (th.currentPage - 1 + len) % len 
					th.action(isNext, i)
				})
				th.$wrap.swipeRight(function() {
					if(th.onAction) return
					th.onAction = true
					var isNext = false
					,len = th.length
					,i = isNext? (th.currentPage + 1 + len) % len : (th.currentPage - 1 + len) % len 
					th.action(isNext, i)
				})
			}
		}
	}
	
	MS.prototype.action = function(isNext, index) {
		var th = this
		,defs = th.defs
		,speed = defs.speed
		,targetFrame = th.$sliderItems.eq(index)
		,nextFrame = th.$sliderItems.eq((index + 1 + th.length) % th.length)

		targetFrame.addClass('ms-prepare-target')
		nextFrame.addClass('ms-prepare-next')
	}
	MS.prototype.autoroll = function() {
		var t = this
		if(!t.onAction && !t.pause) {
				t.onAction = true
				var i = (t.currentPage + 1 + t.length) % t.length
				if(!t.pause) t.action(true, i)
		}
		else {
			clearTimeout(t.flag)
			t.flag = setTimeout(function() {
				t.autoroll()
			}, t.defs.timer)
		}
	}
	MS.prototype.destroy = function() {
		var t = this
		clearTimeout(t.timerhandler)
		t.ps.unwrap()
		t.$wrap.removeAttr('style').children('.ms-nav').remove()
		t.$wrap.children('.ms-slide').removeAttr('style').removeClass('ms-slide')
		$.each( t, function( key, value ) {
			delete t[key]
		})
	}


})(this);


