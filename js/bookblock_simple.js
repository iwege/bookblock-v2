/**
 * bookblock.js v1.0.3
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2012, Codrops
 * http://www.codrops.com
 * 
 * Copyright 2013, iwege
 * http://www.iwege.com
 */
;
(function(window) {

	'use strict';


	var BookBlock = function(element, options){
		this.el = element;
		this._init(options);
		return this;
	};

	BookBlock.prototype = {
		defaults: function(){
		return {
				// class for item
				itemClass:'bb-item',
				// item show class
				showClass:"show",
				// perspective value
				perspective : 1300,
				// if we should show the first item after reaching the end
				circular : false,

				// callback after the flip transition
				// old is the index of the previous item
				// page is the current item's index
				// isLimit is true if the current page is the last one (or the first one)
				onEndFlip : function(old, page, isLimit) {
					return false;
				},
				// callback before the flip transition
				// page is the current item's index
				onBeforeFlip : function(page) {
					return false;
				}
			}
	},
		_attrs:{
			// current item's index
			current : 0,
			// previous item's index
			previous : -1,
			// only support webkit browser
			transEndEventName : 'webkitTransitionEnd'
	},
		extend :function(obj,options){
			// set  options
			var keys =  Object.keys(options);
			var k ;
			while(k = keys.pop()){
				obj[k] = options[k];
			}
			return obj;
	},
	_init : function(options){
			
			
			this.options = this.extend( this.defaults() , options);
			
			this.extend(this, this._attrs);

			// items
			this.itemsEl = this.el.getElementsByClassName(this.options.itemClass);

			// total items
			this.itemsCount = this.itemsEl.length;

			// show first item
			this.activeEl = this.itemsEl.item(this.current);

			this.activeEl.classList.add(this.options.showClass);
			
	},
		_action:function(dir, page) {

			this._navigate(dir, page);

	},
		_navigate:function(dir, page) {


			// callback trigger
			this.options.onBeforeFlip(this.current);

			this.prevItemEl = this.activeEl;

			if (page !== undefined) {

				this.current = page;

			} else if (dir === 'next') {

				if (!this.options.circular && this.current === this.itemsCount - 1) {

					this.end = true;

				} else {

					this.previous = this.current;
					this.current = this.current < this.itemsCount - 1 ? this.current + 1 : 0;

				}

			} else if (dir === 'prev') {

				if (!this.options.circular && this.current === 0) {

					this.end = true;

				} else {

					this.previous = this.current;
					this.current = this.current > 0 ? this.current - 1 : this.itemsCount - 1;

				}

			}

			this.activeEl = !this.options.circular && this.end ? 
															this.prevItemEl : this.itemsEl.item(this.current);
			
			this.prevItemEl.classList.removeClass(this.options.showClass);
			this.activeEl.classList.addClass(this.options.showClass);
			this.prevItemEl = "";
			
		},
		_endAnimation:function(event,dir) {

			if (!event.target.classList.contains("bb-page")) return ;
				
			this.nextItemEl.classList.add(this.options.showClass);
			this.block.classList.remove('active');
			this.activeEl = this.nextItemEl;
			this.s_middle.removeAttribute('style');
			this.end = false;
			this.isAnimating = false;

			var isLimit = (dir === 'next' && this.current === this.itemsCount - 1 || dir === 'prev' && self.current === 0);
			setTimeout(function(){
				// callback trigger
				this.options.onEndFlip(this.previous, this.current, isLimit);
			}.bind(this),10);

	},

		// public method: flips next
		next: function() {
			this._action('next');
		},
		// public method: flips back
		prev: function() {
			this._action('prev');
		},
		// public method: goes to a specific page
		jump: function(page) {

			page -= 1;

			if (page === this.current || page >= this.itemsCount || page < 0) {
				return false;
			}

			this._action(page > this.current ? 'next' : 'prev', page);

		},


	};


 window.BookBlock = BookBlock;
})(window);
