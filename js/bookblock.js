/**
 * jquery.bookblock.js v1.0.3
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
				// speed for the flip transition in ms
				speed : 1000,
				// class for item
				itemClass:'bb-item',
				// item show class
				showClass:"show",
				// easing for the flip transition
				easing : 'ease-in-out',

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
			this.currentEl = this.itemsEl.item(this.current);

			this.currentEl.classList.add(this.options.showClass);

			this.activeEl = this.currentEl;
			// get width of this.$el
			// this will be necessary to create the flipping layout
			this.elWidth = this.el.offsetWidth;

			this._initHTML();
			
	},
		_action:function(dir, page) {

			this._navigate(dir, page);

	},
		_navigate:function(dir, page) {

			if (this.isAnimating) return false;

			// callback trigger
			this.options.onBeforeFlip(this.current);

			this.isAnimating = true;
			this.currentEl = this.itemsEl.item(this.current);

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

			this.nextItemEl = !this.options.circular && this.end ? 
															this.currentEl : this.itemsEl.item(this.current);
			
			this._layout(dir);

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
		_prepareAnimation: function(dir){
		var speed = this.end ? 400 : this.options.speed;
		var self = this;
		this.s_middle.removeEventListener(this.transEndEventName);
		this.s_middle.style.transition = 'all ' + speed + 'ms ' + this.options.easing;
		this.s_middle.addEventListener(this.transEndEventName,function(event){
			this._endAnimation(event,dir);
		}.bind(this));

		this.activeEl.classList.remove(this.options.showClass);

		this.block.classList.add('active');

		setTimeout(function() {
				var style = dir === 'next' ? 'rotateY(-180deg)' : 'rotateY(0deg)';

				if (self.end) {
					// first && last pages lift up 15 deg when we can't go further
					style = dir === 'next' ? 'rotateY(-15deg)' : 'rotateY(-165deg)';
				}
				self.s_middle.style.webkitTransform = style ;
		}, 30);
	},
		// creates the necessary layout for the 3d animation, and triggers the transitions
		_layout: function(dir) {

			var self = this;
					


			var leftHTML = (dir === 'next')? this.currentEl.innerHTML : this.nextItemEl.innerHTML;
			var rightHTML = (dir === 'next')? this.nextItemEl.innerHTML : this.currentEl.innerHTML;

			var left = document.createElement("div");
			var right = document.createElement("div");
			left.innerHTML = leftHTML;
			right.innerHTML = rightHTML;
			
			this.s_left.replaceChild(left.cloneNode(true),this.s_left.firstChild);
			this.s_middle_left.replaceChild(left,this.s_middle_left.firstChild);
			
			this.s_right.replaceChild(right,this.s_right.firstChild);
			this.s_middle_right.replaceChild(right.cloneNode(true),this.s_middle_right.firstChild);

			if (dir === 'prev') {
				this.s_middle.style.webkitTransform = 'rotateY(-180deg)';
			}

			setTimeout(function(){
				self._prepareAnimation(dir);
			},10);


		},
		_initHTML:function(){
			var html = ['  <div class="bb-page bb-left">',
									'    <div class="bb-back">',
									'      <div class="bb-outer">',
									'        <div class="bb-content" style="width:' + this.elWidth + 'px">',
									'          <div class="bb-inner"><div></div>',
									'          </div>',
									'        </div>',
									'        <div class="bb-overlay"></div>',
									'      </div>',
									'    </div>',
									'  </div>',
									'  <div class="bb-page bb-middle">',
									'    <div class="bb-front">',
									'      <div class="bb-outer">',
									'        <div class="bb-content" "bb-content" style="left:' + (-this.elWidth / 2) + 'px;width:' + this.elWidth + 'px">',
									'          <div class="bb-inner"><div></div>',
									'          </div>',
									'        </div>',
									'        <div class="bb-flipoverlay"></div>',
									'      </div>',
									'    </div>',
									'    <div class="bb-back">',
									'      <div class="bb-outer">',
									'        <div class="bb-content" style="width:' + this.elWidth + 'px">',
									'          <div class="bb-inner"><div></div>',
									'          </div>',
									'        </div>',
									'        <div class="bb-flipoverlay"></div>',
									'      </div>',
									'    </div>',
									'  </div>',
									'  <div class="bb-page bb-right">',
									'    <div class="bb-front">',
									'      <div class="bb-outer">',
									'        <div class="bb-content" "bb-content" style="left:' + (-this.elWidth / 2) + 'px;width:' + this.elWidth + 'px">',
									'          <div class="bb-inner"><div></div>',
									'          </div>',
									'        </div>',
									'        <div class="bb-overlay"></div>',
									'      </div>',
									'    </div>',
									'  </div>'];
			this.block = document.createElement("div");
			this.block.classList.add("bb-block");
			this.block.innerHTML = html.join("");
			this.el.insertBefore(this.block,this.el.firstChild);

			this.block.style.webkitPerspective = this.options.perspective;

			// basic structure:
			// 1 element for the left side.
			this.s_left = this.block.querySelector(".bb-left .bb-inner"); // 1 element for the flipping/middle page
			
			this.s_middle = this.block.querySelector(".bb-middle");
			var middle_inner = this.s_middle.getElementsByClassName("bb-inner");
			this.s_middle_left = middle_inner[0];
			this.s_middle_right = middle_inner[1];

			// 1 element for the right side
			this.s_right = this.block.querySelector(".bb-right .bb-inner");



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
		// public method: check if isAnimating is true
		isActive: function() {
			return this.isAnimating;
		},

	};


 window.BookBlock = BookBlock;
})(window);
