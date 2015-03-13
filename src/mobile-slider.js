/*!
 * mobile-slider
 * https://github.com/zxdong262/mobile-slider
 * License: MIT
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
		$.fn.paperSlider = function(opts) {
			return new PS(opts, this)
		}
	}

	function MS(_opts, _$obj) {
		var 
		defaults = {
			speed: 1000 //animation time
			,timer: 4000 //time stops between auto roll
			,autoSlider: false //auto slider
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
			,top:0
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
		,anim1 = {}
		,anim2 = {}
		,css1 = {}
		,css2 = {}
		,prop1 = 'bottom'
		,prop2 = 'top'

		if(defs.vertical && !next) {
			prop1 = 'top'
			prop2 = 'bottom'
		}
		else if(!defs.vertical && !next) {
			prop1 = 'left'
			prop2 = 'right'
		}
		else if(!defs.vertical && next) {
			prop1 = 'right'
			prop2 = 'left'
		}

		css1[prop1] = '100%'
		css1[prop2] = 'auto'
		anim1[prop1] = 0

		css2[prop1] = '200%'
		css2[prop2] = 'auto'
		anim2[prop1] = '100%'

		if($.isFunction(th.defs.beforeAction)) th.defs.beforeAction.call(th)
		if(defs.vertical) {
			targetFrame.css(css1)
			nextFrame.css(css2)
			targetFrame.animate(anim1, speed)
			nextFrame.animate(anim2, speed, function() {
				th.currentPage = index
				th.onAction = false
				if($.isFunction(th.defs.afterAction)) th.defs.afterAction.call(th)
				if(defs.autoSlider) {
					clearTimeout(th.timerhandler)
					th.timerhandler = setTimeout(function() {
						th.autoroll()
					}, defs.timer)
				}
			})
		}


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


