/*!
 * mobile-slider
 * https://github.com/zxdong262/mobile-slider
 * License: MIT
 */


;(function(window, undefined) {


	//for seajs
	if ( typeof define === 'function' ) {
		define( function(require, exports) {
			factory(require('zepto'))
		})
	}

	//for direct use
	else factory(Zepto)

	//factory
	function factory($) {
		$.fn.mobileSlider = function(opts) {
			return new MS(opts, this)
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
			,navTopHtml: '&and;' //top nav button html
			,navBottomHtml: '&or;' //bottom nav button html
			,zIndex:20 //base index
			,ease: 'linear'
			,beforeAction: null //callback before slider fires, param ms(MS instance)
			,afterAction: null //callback fater slider finish. param ms(MS instance)
			,startIndex: 0 //start from index, start from 0
			,vertical: true //is vertical slider
			,hasIndicator: false //show Indicator
		}
		,opts = _opts
		,$obj = _$obj
		,th = this
		,defs = th.defs = $.extend(defaults, opts)
		,cssSet = {
			position:'absolute'
			,width:'100%'
			,height:'100%'
			,'z-index': defs.zIndex
		}
		if(defs.vertical) {
			cssSet.top = '100%'
			cssSet.left = 0
		}
		else {
			cssSet.left = '100%'
			cssSet.top = 0
		}
		th.version = '0.0.1'
		th.$wrap = $obj
		th.$wrap.addClass((defs.vertical?'ms-vertical':'') + (defs.hasVerticalTopNav?'':' ms-hide-top-nav'))
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

		//nav button
		if(defs.hasNav) {
			th.$wrap.append('<span class="ms-nav ms-nav-prev">' + (defs.vertical?defs.navTopHtml:defs.navLeftHtml) +
			'</span><span class="ms-nav ms-nav-next">' + (defs.vertical?defs.navBottomHtml:defs.navRightHtml) + '</span>')
			th.$wrap.children('.ms-nav').css('z-index', defs.zIndex + 10 + th.length)
			if(defs.navEvent) th.$wrap.on('click tap', '.ms-nav', function() {
				if(th.onAction) return
				var isNext = $(this).hasClass('ms-nav-next')
				,len = th.length
				,i = (th.currentPage + len) % len
				th.action(isNext, i)
			})
		}

		//Indicator
		if(defs.hasIndicator) {
			var dotsHtml = '<div class="ms-dots">'
			for(var di = 0;di < th.length;di ++) {
				dotsHtml += '<span class="ms-dot" data-ms-index="' + di + '"></span>'
			}
			dotsHtml += '</div>'

			th.$wrap.append(dotsHtml)
			var tdots = th.$wrap.children('.ms-dots')
			tdots.css({
				'z-index': defs.zIndex + 20 + th.length
			})
			if(defs.vertical) tdots.css({
				'margin-top': - (0.5 * tdots.height())
			})
			else tdots.css({
				'margin-left': - (0.5 * tdots.height())
			})

			if(defs.navEvent) th.$wrap.on('click tap', '.ms-dot', function() {
				if(th.onAction) return
				var i = $(this).data('ms-index')
				if(i === th.currentPage) return
				var isNext = i > th.currentPage
				,len = th.length
				,ind = (th.currentPage + len) % len
				th.action(isNext, ind, i)
			})
		}

		//swipe event
		if(defs.swipeEvent) {

			if(defs.vertical) {
				th.$wrap.swipeUp(function() {
					if(th.onAction) return
					var isNext = true
					,len = th.length
					,i = (th.currentPage + len + 1) % len
					th.action(isNext, th.currentPage, i)
				})
				th.$wrap.swipeDown(function() {
					if(th.onAction) return
					var isNext = false
					,len = th.length
					,i = (th.currentPage + len - 1) % len
					th.action(isNext, th.currentPage, i)
				})
			}
			else {
				th.$wrap.swipeLeft(function() {
					if(th.onAction) return
					var isNext = true
					,len = th.length
					,i = (th.currentPage + len + 1) % len
					th.action(isNext, th.currentPage, i)
				})
				th.$wrap.swipeRight(function() {
					if(th.onAction) return
					var isNext = false
					,len = th.length
					,i = (th.currentPage + len - 1) % len
					th.action(isNext, th.currentPage, i)
				})
			}
		}

		//start
		th.currentPage = th.currentPage - 1 + th.length
		th.autoroll()

	}
	
	MS.prototype.action = function(isNext, index, nextIndex) {
		this.onAction = true
		clearTimeout(this.timerhandler)
		var th = this
		,hasNextIndex = (nextIndex !== undefined)
		,defs = th.defs
		,speed = defs.speed
		,targetFrame = th.$sliderItems.eq(index)
		,nextFrame = th.$sliderItems.eq(hasNextIndex?nextIndex : (index + 1 + th.length) % th.length)
		,anim1 = {}
		,anim2 = {}
		,css1 = {
			'z-index': defs.zIndex + 2
		}
		,css2 = {
			'z-index': defs.zIndex + 2
		}
		,prop1 = 'bottom'
		,prop2 = 'top'

		if(defs.vertical && isNext) {
			prop1 = 'top'
			prop2 = 'bottom'
		}
		else if(!defs.vertical && isNext) {
			prop1 = 'left'
			prop2 = 'right'
		}
		else if(!defs.vertical && !isNext) {
			prop1 = 'right'
			prop2 = 'left'
		}

		css1[prop1] = '0'
		css1[prop2] = 'auto'
		anim1[prop1] = '-100%'

		css2[prop1] = '100%'
		css2[prop2] = 'auto'
		anim2[prop1] = '0'

		th.$sliderItems.css({
			'z-index': defs.zIndex
		})

		th.$wrap.find('.ms-dot[data-ms-index="' + th.currentPage + '"]')
		.addClass('on')
		.siblings('.ms-dot').removeClass('on')

		if($.isFunction(th.defs.beforeAction)) th.defs.beforeAction.call(th)

		targetFrame.css(css1)
		nextFrame.css(css2)
		targetFrame.animate(anim1, speed)
		nextFrame.animate(anim2, speed, function() {
			th.currentPage = hasNextIndex?nextIndex : (index + 1 + th.length) % th.length
			th.$wrap.find('.ms-dot[data-ms-index="' + th.currentPage + '"]')
			.addClass('on')
			.siblings('.ms-dot').removeClass('on')

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

	MS.prototype.autoroll = function() {
		var t = this
		var i = (t.currentPage + t.length) % t.length
		if(!t.pause) t.action(true, i)
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


