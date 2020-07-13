(function($, undefined){
	/* @file custom view
	 * @release date 2018.08.30 14:53:01 
	 */
	$.themesURI = 'http://record.meizu.cn/themes/zu_1000/images/';
})(nTalk);
;(function($, undefined){
	//====================================================================================
	/**
	 * 自定义滚动条对像
	 * @class myScroll
	 * @constructor
	 */
	$.myScroll = $.Class.create();
	$.myScroll.prototype = {
		name: 'myScroll',
		mainBox:	null,
		contentBox:	null,
		scrollBar:	null,
		_wheelFlag:  0,
		_wheelData:	-1,
		timeID:		null,
		options: null,
		temp: false,
		/**
		 * 初始化滚动条对像
		 * @param  HtmlElement|nTalkElements  mainBox    可视区节点
		 * @param  HtmlElement|nTalkElements  contentBox 内容区节点
		 * @param  String                     className  滚动条className
		 * @param  json                       options    滚动条属性、样式
		 */
		initialize: function(mainBox, contentBox, className, options) {
			this.mainBox = mainBox.talkVersion ? mainBox : $(mainBox);
			this.contentBox = contentBox.talkVersion ? contentBox : $(contentBox);
			this.options = $.extend({width: 0}, options);
			if( !this.mainBox.length || !this.contentBox.length ) return;

			this._createScroll(className);

			this.resizeScroll();
			this._tragScroll();
			this._wheelChange();
			this._clickScroll();
		},
		/**
		 * 滚动条移至底端
		 * @return {void}
		 */
		scrollBottom: function(){
			var self = this;
			if( !this.mainBox.length || !this.contentBox.length ) return;

			clearTimeout(this.timeID);
			this.timeID = setTimeout(function(){
				self.resizeScroll();

				self.mainBox.scrollTop( self.mainBox.scrollHeight() );
				self.scrollBox.css('top', Math.floor(self.mainBox.offset().top - self.scrollBox.offset().top) + 'px');
				self.scrollBar.css('top', (self.scrollBox.height() - self.scrollBar.height()) + "px");
			//修正鼠标滚动时从顶部开始问题
				self._wheelFlag = (self.mainBox.height() - self.scrollBar.height()) * 12;
			}, 50);
		},
		/**
		 * 创建滚动条节点
		 * @param  String  className  滚动条className
		 * @return nTalkElements      返回滚动条节点
		 */
		_createScroll: function(className) {
			this.mainBox.css('overflow-y', 'hidden');
			this.scrollBox = $({className: 'view-scrollBox', style:$.STYLE_NBODY + 'display:block;border-radius:10px;'}).appendTo(this.mainBox);
			this.scrollBar = $({className: className, style:$.STYLE_NBODY + 'background:#c8c8c8;border-radius:10px;position:absolute;width:7px;top:0;'}).appendTo(this.scrollBox);
			$({tag:'span', style:$.STYLE_NBODY}).appendTo(this.scrollBar);
			return this.scrollBar;
		},
		/**
		 * 调整滚动条定位
		 * @return
		 */
		resizeScroll: function() {
			var mainBoxWidth = this.mainBox.width();
			var _border = (parseInt(this.mainBox.css('border-left-width')) || 0) + (parseInt(this.mainBox.css('border-right-width')) || 0);
			var _margin = parseInt(this.contentBox.css('margin-left')) + parseInt(this.contentBox.css('margin-right'));
			var _height = this.mainBox.height() - 10 - _border;
			var _barWidth= this.scrollBar.width() || 6;

			this.scrollBox.css({
				//2016.03.11更改颜色
				position:	'absolute',
				background:	'#f3f3f3',
				width:	this.scrollBar.width() + 'px',
				height:	this.mainBox.height() + 'px',
				//2016.03.11更改距离右侧的距离
				left:	(mainBoxWidth - _barWidth - _border-4) + 'px',
				top:	'0px'
			});
			this.contentBox.css({
				width:	Math.max(this.options.width, (mainBoxWidth - _barWidth - _margin)) + 'px'
			});
			//for IE8 ul节点无内容时，高为0
			var _contentHeight = Math.max(this.contentBox.height(), this.mainBox.height());
			var _scrollHeight = parseInt(_height * (_height / _contentHeight)) || 300;
			if( _scrollHeight >= this.mainBox.height() ) {
				this.scrollBox.display();
			}else{
				this.scrollBox.display(1);
			}
			this.scrollBar.css('height', _scrollHeight + 'px');
		},
		/**
		 * 拖动滚动条
		 * @return
		 */
		_tragScroll: function() {
			var self = this;
			this.scrollBar.bind('mousedown', function(event){
				var event = $.Event.fixEvent(event),
					mainHeight = self.mainBox.height(),
					scrollTop = self.scrollBar.offset().top - self.scrollBox.offset().top,
					top = event.clientY
				;
				$(document).bind('mousemove', scrollGo);
				$(document).bind('mouseup', function(event) {
					$(document).removeEvent('mousemove', scrollGo);
				});

				function scrollGo(event) {
					var flag = $.Event.fixEvent(event).clientY - top + scrollTop;
					if( flag > (mainHeight - self.scrollBar.height()) ) {
						flag = mainHeight  - self.scrollBar.height();
					}
					if (flag <= 0) {
						flag = 0;
					}
					var sTop = flag * (self.contentBox.height() / self.mainBox.height());

					self.mainBox.scrollTop( sTop );
					self.scrollBox.css('top',   Math.floor(sTop) + "px");
					self.scrollBar.css('top',   flag + "px");
					self._wheelData = flag;
				}
			}).hover(function(event){
				$(this).css('background', '#a6a6a6');
			}, function(event){
				//2016.03.11更改颜色
				$(this).css('background', '#c8c8c8');
			});
		},
		/**
		 * 鼠标滚轮滚动，滚动条滚动
		 * @return
		 */
		_wheelChange: function() {
			var self = this,
				flag = 0,
				rate = 0
			;
			this._mouseWheel(this.mainBox, function(data) {
				self._wheelFlag += data;
				if (self._wheelData >= 0) {
					flag = self._wheelData;
					self.scrollBar.css('top', flag + "px");
					self._wheelFlag = self._wheelData * 12;
					self._wheelData = -1;
				} else {
					flag = self._wheelFlag / 12;
				}
				if (flag <= 0) {
					flag = 0;
					self._wheelFlag = 0;
				}
				if (flag >= (self.mainBox.height() - self.scrollBar.height())) {
					flag = (self.mainBox.height()  - self.scrollBar.height());
					self._wheelFlag = (self.mainBox.height() - self.scrollBar.height()) * 12;
				}

				var sTop = flag * (self.contentBox.height() / self.mainBox.height());

				self.mainBox.scrollTop( sTop );
				self.scrollBox.css('top', Math.floor(sTop) + 'px');
				self.scrollBar.css('top', flag + "px");
			});
		},
		/**
		 * 点击滚动条定位
		 * @return
		 */
		_clickScroll: function() {
			var self = this;
			this.scrollBox.click(function(event) {
				event = $.Event.fixEvent(event);
				var _top = event.clientY + $(window).scrollTop() - self.mainBox.offset().top - self.scrollBar.height() / 2;
				if (_top <= 0) {
					_top = 0;
				}
				if (_top >= (self.mainBox.height() - self.scrollBar.height())) {
					_top = self.mainBox.height() - self.scrollBar.height();
				}
				if (event.target != self.scrollBar) {
					var sTop = _top * (self.contentBox.height() / self.mainBox.height());
					self.mainBox.scrollTop( sTop );
					self.scrollBox.css('top', Math.floor(sTop) + "px");
					self.scrollBar.css('top', _top + "px");
					self._wheelData = _top;
				}
			});
		},
		/**
		 * 鼠标滚动事件
		 * @param  nTalkElements obj     滚动条控制区域节点
		 * @param  Function      handler 事件执行函数
		 * @return
		 */
		_mouseWheel: function(obj, handler) {
			obj.bind('mousewheel', function(event) {
				var data = -getWheelData(event);
				handler(data);
				if (document.all) {
					window.event.returnValue = false;
				} else {
					event.preventDefault();
				}
			}).bind('DOMMouseScroll', function(event) {
				var data = getWheelData(event);
				handler(data);
				event.preventDefault();
			});

			/**
			 * 获取滚动距离
			 * @param  htmlEvent event
			 * @return number           返回滚动距离
			 */
			function getWheelData(event) {
				event = $.Event.fixEvent(event);
				return event.wheelDelta ? event.wheelDelta : event.detail * 40;
			}
		}
	};

	/** ====================================================================================================================================================
	 * 聊天窗视图对像
	 * @type {Object}
	 */
	$.chatView = $.Class.create();
	$.chatView.prototype = {
		name: 'chatView',
		contains: null,
		loadElement: null,
		chatElement: null,
		messageElement: null,
		displayiFrame: null,
		chatHistory: null,
		objFile: null,
		objImage: null,
		_tempHeader: null,
		_chatsHeader: null,
		_chatsElement: null,
		_maxNumber: 50,
		_sendKey: 'Enter',
		_editorStart: 0,
		_initFace: false,
		_eventFunction: new Function(),
		scroll: null,
		_listenNumber: 0,
		_listenTimeID:null,
		_inputTimerID: null,
		buttonSelectors: null,
		imageHash: {}, //2015.11.01 记录已出现的图片的msgid
		evalRepeatClick: true, //2016.02.14 预防重复点击评价
		receiveMsgCount: 0,
		mode: null,
		options: null,
		siteid: '',
		settingid: '',
		isRobotSuggest: true,
		/**
		 * 对像初始化
		 * @param  {json}     options 配置选项
		 * @param  {chatMode} mode    chatMode引用
		 */
		initialize: function(options, mode){
			this.options         = options;
			this.siteid          = this.options.siteid;
			this.settingid       = this.options.settingid;
			this.mode            = mode;
			this.buttonSelectors = {
				'face':    'chat-view-face',
				'image':   'chat-view-image',
				'file':    'chat-view-file',
				'history': 'chat-view-history',
				'loadhistory': 'chat-view-load-history',
				'evaluate':'chat-view-evaluate',
				'capture': 'chat-view-capture',
				'capoptions': 'chat-view-capture-options',
				'csr':     'chat-view-change-csr',
				'manual':  'chat-view-switch-manual',
				'submit':  'chat-view-submit',
				'exp':     'chat-view-exp',
                'xiaonengver': 'chat-view-xiaoneng-version'
			};

			if( !this.mode ){
				$.Log('mode is null', 3);
				return;
			}

			this.scroll = null;
			this._create();
		},
		/**
		 * @method _create 创建聊天窗体
		 * @return {void}
		 */
		_create: function(){
			this.contains       = $({className: 'chat-view-contains', key: this.settingid, style: $.STYLE_NBODY + 'overflow:hidden;width:100%;height:auto;position:relative;left:0;top:0;padding-top:1px solid #fff\\0;'}).appendTo( this.options.chatContainter );

			this.loadElement    = $({className: 'chat-view-load', style: $.STYLE_BODY + 'height:' + this.options.height + 'px;_height:' + (this.options.height - 240) + 'px;box-sizing:border-box;display:block;'}).appendTo(this.contains).html( this._getViewHtml('load') );

			this.chatElement    = $({className: 'chat-view-window', style: $.STYLE_BODY + 'width:100%;height:auto;display:none;padding-top:1px solid #fff\\0;'}).appendTo(this.contains).html( this._getViewHtml('window') );

			this.messageElement = $({className: 'chat-view-message', style: $.STYLE_BODY + 'height:' + this.options.height + 'px;display:none;float:left;width:100%;'}).appendTo(this.contains).html( this._getViewHtml('message') );

			this.displayiFrame  = $({tag:'iframe', id:'chat-view-submit-iframe', name:'chat-view-submit-iframe', className:'chat-view-submit-iframe', style:$.STYLE_NBODY + 'display:none;'}).appendTo( this.contains );

			this.contains.append( this._getViewHtml('alert') );

			this.chatHistory    = this.chatElement.find('.chat-view-window-history');

			//
			this._tempHeader    = this.options.chatHeader.find('.chat-header-icon,.chat-header-name,.chat-header-sign,.ntalk-button-maxresize,.ntalk-button-min,.ntalk-button-close');

			if( !this.options.chatHeader.find('.header-chatrecord-title').length ){
			$({className: 'header-chatrecord-title', style:$.STYLE_BODY + 'font-weight:bold;float:left;margin:15px 10px 5px 20px;height:20px;visibility:visible;overflow:hidden;display:none;'}).appendTo( this.options.chatHeader.find('.chat-header-body') ).html( $.lang.button_view );
			}
			if( !this.options.chatHeader.find('.header-chatrecord-close').length ){
			$({className: 'header-chatrecord-close', style: $.STYLE_NBODY + 'float:right;cursor:pointer;margin:20px 5px 0 0;width:20px;height:20px;position:relative;display:none;'}).appendTo(this.options.chatHeader);
			}

			this._chatsHeader   = this.options.chatHeader.find('.header-chatrecord-title,.header-chatrecord-close');
			this._chatsElement  = this.chatElement.find('.chat-view-float-history');

			this._bind();

			this.callChatResize(this.options.width, this.options.height);
			this._meizu_special();
		},

         //2017.05.27 魅族的定制
          _meizu_special:function(){

          	var meizu_chat_view_window_bottom=this.contains.find('.chat-view-window-bottom');
            var meizu_chat_view_end_session=this.contains.find('.chat-view-end-session');
            var meizu_chat_view_submit=this.contains.find('.chat-view-submit');
          	var meizu_chat_view_window_history=$('.chat-view-window-history');
          	var meizu_chat_view_window_editor=$('.chat-view-window-editor').find('textarea');
            var meizu_body_chat_containter=$('.body-chat-containter');
            var meizu_chat_view_options_menu=$('.chat-view-options-menu');
            var meizu_view_fileupload_body=$('.view-fileupload-body');
			var meizu_chat_view_options = $('.chat-view-options');
			meizu_chat_view_options.css({
				'background-color': '#07CDFF',
				'border-radius': '0px 4px 4px 0px',
				'-moz-border-radius': '0px 4px 4px 0px',
				'-webkit-border-radius': '0px 4px 4px 0px'
			});
            meizu_view_fileupload_body.css({
            	'border-color':'#ffffff'

            });
           meizu_chat_view_window_editor.css({
            	height:$.browser.Quirks ? '73px' : '63px',
            	'box-shadow':'white 0px 0px 0px inset'


            });
             meizu_chat_view_window_history.css({
             	'background-color':'#f5f5f5',
             	'border-left':'solid 1px #f5f5f5',
             	'border-right':'solid 1px #f5f5f5',

             	'width':'448px'
             });
            meizu_body_chat_containter.css({

				'border-radius': '0',
				'-moz-border-radius': '0px 0px 0px 0px',
				'-webkit-border-radius': '0px 0px 0px 0px',
				'border-right':  '1px solid #f5f5f5',
				'border-bottom': '1px solid #f5f5f5',
				'border-left':   '1px solid #f5f5f5',
				'width':  (+this.options.width  - 2) + 'px',
				'height': (+this.options.height - 1) + 'px'

            });
          	meizu_chat_view_window_bottom.css('background','#ffffff');

			meizu_chat_view_end_session.css({
				margin:'6px 10px 6px 0px',
				'background-color': '#E6E6E6',
				'font-size':'12px',
				'width':'80px',
				height: '26px',
				'line-height': '26px',
				'border-radius':'4px',
				'text-align':'center'

            });
          	meizu_chat_view_submit.css({
                  'width': '54px',
                 'background-color':'#01B8EF',
                  'font-size':'13px',
                  height:'26px',
                 'line-height': '26px',
                 'border-radius':'4px 0px 0px 4px',
                 color:'#fff'

          	});

          },


		/**
		 * @method close 关闭聊窗口
		 * @return {void}
		 */
		close: function(){
			this.contains.remove();
			this.contains = null;

			if( $.isFunction(this._eventFunction) ){
				$(document.body).removeEvent('click', this._eventFunction);
			}
		},
		/**
		 * @method minimize 最小化聊窗口
		 * @return {void}
		 */
		minimize: function(){
			this.contains.css({
				width: ($.browser.msie&&$.browser.ieversion<=7 ? 1 : 0) + 'px',
				height:($.browser.msie&&$.browser.ieversion<=7 ? 1 : 0) + 'px'
			});
		},
		/**
		 * @method maximize 还原聊窗口
		 * @return {void}
		 */
		maximize: function(){
			this.contains.css({
				width: '100%',
				height:'auto'
			});
		},
		/**
		 * @method switchUI 切换视图
		 * @param {string} type 视图类型[加载:loading｜会话:window｜留言:message|异常:error]
		 * @return {void}
		 */
		switchUI: function(type){
			var self = this;
			if( !this.contains ) return;

			switch(type){
				case this.mode.CON_VIEW_WINDOW:
					this.contains.find('.chat-view-load,.chat-view-message').display();
					this.contains.find('.chat-view-window').display(1);

					if( !this.scroll ){
						this.scroll = new $.myScroll(this.chatHistory, this.chatHistory.find('ul'), 'chat-view-scrollBar', {width: 411});
					}
					break;
				case this.mode.CON_VIEW_MESSAGE:
					this.contains.find('.chat-view-load,.chat-view-window').display();
					this.contains.find('.chat-view-message').display(1);

					this._viewHistory(false);

					this._stopListen();
					//2014.11.21
					//留言区出现滚动条时，聊窗变更为最大模式
					/*
					setTimeout(function(){
						var announcement = self.messageElement.find('.chat-view-message-announcement');
						var messageHeight = 0;
						if( announcement.css('display') != 'none' ){
							messageHeight += announcement.height() + 20;
						}
						messageHeight += Math.max(self.messageElement.find('.chat-view-message-table').height(), self.messageElement.find('.chat-view-message-body').height());
						if( messageHeight > self.contains.height() || announcement.html().toString().toLowerCase().indexOf('<img') > -1 ){
							self.mode.manageMode.view._callMaxResize();
						}
					}, 10);
					*/
					break;
				case this.mode.CON_VIEW_ERROR:
					this.contains.find('.chat-view-window,.chat-view-message').display();
					this.contains.find('.chat-view-load').display(1);
					this.contains.find('.chat-view-load-icon, .chat-view-load-info').display();
					this.contains.find('.chat-view-load-error').display(1).find('span');
					break;
				default:
					this.contains.find('.chat-view-window,.chat-view-message').display();
					this.contains.find('.chat-view-load').display(1);
					this.contains.find('.chat-view-load-error').display();
					this.contains.find('.chat-view-load-icon, .chat-view-load-info').display(1);
					break;
			}
		},
		/**
		 * 添加消息, 按消息显示位置分类: first|goods|left|right|bottom|system
		 * @param {string} type
		 * @param {json}   data
		 * 添加消息排序,06.17 添加多客服系统消息排序
		 */
		showMessage: function(position, data){
			var self = this, liElement, style, cstyle, selector, before, compare, beforeCount = 1;
			style = [
			//2016.03.18更改padding 值
				$.STYLE_NBODY + 'background:transparent;list-style:none outside none;display:block;padding:5px 64px 0 0;',
				$.STYLE_NBODY + 'background:transparent;list-style:none outside none;display:block;padding:5px 0 0 58px;text-align:right;',
				$.STYLE_NBODY + 'background:transparent;list-style:none outside none;display:block;padding:5px 10px 0 10px;text-align:center;'
				];

			//消息区为示消息上限
			while( this.chatHistory.find('li[class]').length >= this._maxNumber ){
				this.chatHistory.find('li[class]').first().remove();
			}

			switch(position){
			case 'left':
				cstyle	= style[0];
				selector= data.msgid;
				break;
			case 'bottom'://客服输入状态消息
				cstyle	= style[0];
				selector= 'systembottom';
				return;

			case 'right':
				cstyle	= style[1];
				selector= data.msgid;
				break;
			case 'goods'://商品信息
				cstyle	= style[2];
				selector = 'first';
				break;
			case 'system'://系统提示消息
				cstyle = style[2];
				selector = 'system';
				break;
			case 'system0'://会话合并提示消息
				cstyle = style[2];
				selector = 'system0';
				break;
			case 'info'://系统提示消息
				cstyle = style[2];
				selector = data.msgid;
				break;
			case 'otherinfo'://faq信息
				cstyle  = style[0];
				selector= data.msgid;
				break;
			default://欢迎消息
				cstyle = style[2];
				selector = 'first';
				break;
			}
			if( this.chatHistory.find('li.' + selector).length && selector != 'system' ){

				//已存在客服输入状态时，直接显示
				if( selector == 'systembottom' ){
					this.chatHistory.find('li.' + selector).css('visibility', 'hidden');
				}
				liElement = this.chatHistory.find('li.' + selector).html( this._getMessageHtml(position, this._contentFilter(data)) );
			}else if( !data ){
				//用于清除消息
				this.chatHistory.find('li.' + selector).remove();

			}else{
				//系统消息，直接替换
				if( selector === 'system' || selector === 'system0' ){
					this.chatHistory.find('li.' + selector).remove();
				}
				//置顶消息
				if( selector==='first' && this.chatHistory.find('ul li').length > 1 ){
					before = this.chatHistory.find('li').eq(0);
				}
				//消息排序，排序规则
				else{
					compare = this.chatHistory.find('li').eq( 0 - beforeCount );
					if( compare.indexOfClass('first') ){
						before = null;
					}
					else{
						if( compare.indexOfClass('systembottom') ){
							beforeCount++;
							before = compare;
							compare = this.chatHistory.find('li').eq( 0 - beforeCount );
						}

						if( selector === 'system' && this.mode.enterUserId){
							while( compare && compare.attr("userid") == this.mode.enterUserId){
								if( beforeCount >= 5 ){
									break;
								}
								beforeCount++;
								before = compare;

								compare = this.chatHistory.find('li').eq( 0 - beforeCount );
							}
							this.mode.enterUserId = "";
						}

						while( compare && !compare.indexOfClass('first') && !compare.indexOfClass('system') && compare.attr("localtime") && beforeCount <= this.chatHistory.find('li').length && parseFloat( compare.attr("localtime") ) >= data.localtime ){
							if( beforeCount >= 5 ){
								break;
							}
							beforeCount++;
							before = compare;

							compare = this.chatHistory.find('li').eq( 0 - beforeCount );
						}
					}
				}
				try{
					liElement = $({tag:'li', className: selector, localtime: data.localtime, userid: (data.userid || ''), style: cstyle, history:data.history || '0'}).appendTo(this.chatHistory.find('ul'), before);
					liElement.insert( this._getMessageHtml(position, this._contentFilter(data) ) );
						// 解决魅族a标签全局样式冲突
						liElement.find('a').attr('onmouseover','this.style.color="red";');
						liElement.find('a').attr('onmouseout','this.style.color="blue";');
						liElement.find('a').css({
							'color':'blue'
						})

					if( selector == 'systembottom' ){
						liElement.find('table td.view-history-content').css('width', '60px');

					}
				}catch(e){
					$.Log(e, 3);
				}

				//2016.9.10 debug解决机器人反向引导中含有空格时跳到新的空白页面
                if(data.xnlink) {
                    setTimeout(function(){
                        var el = liElement.find('.robotQuestion');
                        el.click(function(event){
                            var event = $.Event.fixEvent(event);
                            event.preventDefault();
                            event.stopPropagation();
                            nTalk.chatManage.get(this.settingid).send($(this).html().replace(/[[0-9]*]\s/,""));
                            return false;
                        });
                    },200);
                }

				if( selector != 'system' ){
					//消息区连接打开方式处理
					liElement.find('a').click(function(){
						//2015.11.10 如果A链接有onclick属性，则不执行此方法
						if( this.onclick ) return;
						var href = $(this).attr('_href') || $(this).attr('href');
						$(this).attr('_href', href).attr('target', '_self').attr('href', '###');
						if( typeof window.openURLToBrowser == "function"){
							window.openURLToBrowser(href);
							return false;
						}
						window.open(href);
						return false;
					});
				}

				if( data.type == 1 && position=='left' ){
					//收到消息时，隐藏输入状态
					this.chatHistory.find('li.systembottom').css('visibility', 'hidden');
                     	//2016.03.23
			         $('.chat-view-xiaoneng-version').css('visibility', 'hidden');

				}

				if( data && /^(1|2|4|6)$/i.test(data.type) && position=='left' && typeof window.webInfoChanged == "function" && (data.msgid != 'welcome') && (data.history != 1) && data.msgsystem != "true" ) {
					webInfoChanged(400, '{"num":' + (++this.receiveMsgCount) + ', "showNum":1}', false);
				}
			}
			//2016.03.22增加隐藏消息
			//客服输入状态消息3秒后隐藏
			if( selector == 'systembottom' ){
				clearTimeout(this._inputTimerID);
				this._inputTimerID = null;
				this._inputTimerID = setTimeout(function(){
					self.chatHistory.find('li.systembottom').css('visibility', 'hidden');

				}, 3E3);
			}

			if( this.scroll ){
				this.scroll.scrollBottom();
			}

			//2015.09.28 加载链接URL解析内容
			if( data && data.type==1 ){
				this.loadLinkContainer(data.msgid);
			}

			if( data && /^(1|2|4|6|9|13)$/i.test(data.type) ){
				this.updateMessage(data.msgid, data.type, data, position==='left');
			}

			//2015.07.01 解决欢迎语ie7错位问题
			if($(".welcome").length==1){
				$(".welcome").css("visibility","hidden").css("visibility","visible");
			}

			return selector;
		},
		/**
		 * 移除消息指定消息
		 * @return {string} msgid 消息ID
		 */
		removeMessage: function(msgid){
			this.chatHistory.find('.' + msgid).remove();
		},
		/**
		 * 更新消息状态\内容
		 * @param  string   msgid   消息ID
		 * @param  bumber   type    消息类型ID[1:文本消息;2:图片消息;4:文件消息;5:特定系统消息;9:系统提示消息;]
		 * @param  json     data    消息内容
		 * @param  boolean  receive 是否是接收的消息,用于区分访问发送的与客服发送的文件、图片消息
		 * @return {void}
		 */
		updateMessage: function(msgid, type, data, receive){
			var self = this, position,
				liElement   = this.chatHistory.find('.' + msgid).last(),
				bodyElement = liElement.find('.view-history-body').last(),
				maxHeight = $(".chat-view-window-history").height()-95;
			//2015.05.24 消息下存在更新选项时，绑定事件
			liElement.find(".view-history-more").bind("click", function(){
				bodyElement.css({
					'height': 'auto',
					'overflow-y': 'visible',
					'max-height': 'none'
					});
				if( self.scroll ){
					self.scroll.resizeScroll();
				}
				$(this).display();
			});
			//2015.05.14 检查消息高度，若大于设定的最大高度，则显示更多按钮
			/*curHeight = bodyElement.height();
			if($.base.checkID(data.userid) == $.CON_CUSTOMER_ID && (bodyElement.scrollHeight() > maxHeight || bodyElement.height() > maxHeight)){
				bodyElement.css({
					'height':	maxHeight+"px",
					'overflow-y':'hidden'
				});

				liElement.find('.view-history-more').display(1);
			}*/

			switch(type+''){
				case "1":
					if( typeof data === 'string' ){
						//消息发送失败时，显示可以重新发送的连接
						this._showResend(msgid, data).click(function(event){
							$.Event.fixEvent(event).stopPropagation();

							$(this).parent().parent().display();
							self.mode.resend(msgid);
						});
					}else if( bodyElement.find('.ntalk-preview').length ){
						//2015.03.28 常规消息中含图片时预加载图片，显示小图，点击可查看大图
						//2015.05.06 机器人版本，用户配置的消息可能含存在同一条消息中有多个超大图片
						bodyElement.find('.ntalk-preview').each(function(i){
							var imageElement = this,
								imageurl = $(imageElement).attr('sourceurl')
							;

							$.require(imageurl + '#image', function(image){
								if( image.error ){
									$(imageElement).display();
								}else{
									var attr = $.zoom(image, 332, 500);
									$(imageElement).attr({
										width: attr.width,
										height:attr.height,
										src: image.src
									}).click(function(event){
										//2015.11.10 全屏显示图片时需要传入msgid，便于前后翻看图片
										self._fullScreenImage(this, msgid);
									}).css({
										width:  attr.width + 'px',
										height: attr.height+ 'px',
										cursor: 'pointer'
									});
								}

								if( self.scroll && self.scroll.scrollBottom ){
									self.scroll.scrollBottom();
								}
							});
						});
					}
					break;
				case "13":
					//展示商品信息
					var self = this, attr, k, html = [], options, json = data.msg.item || data.msg.items || {};
					if( !json || $.isEmptyObject(json) ){
						return;
					}
					json.url = json.url || 'javascript:void(0)';
					if( json.name ){
						html.push( '<a href="',json.url,'" target="_blank" style="' + $.STYLE_BODY + 'color:#0479D9;font-weight:bold;">' + json.name + '</a>' );
					}
					$.each(json, function(k, productAttr){
						if( $.isArray(productAttr) ){
							productAttr[1] = (k.indexOf('price')>-1&&json['currency']&&(productAttr[1]+'').indexOf(json['currency'])<=-1 ? json['currency'] : '') + '' + productAttr[1];

							html.push( '<div style="' + $.STYLE_BODY + '"><span style="' + $.STYLE_BODY + '">' + productAttr[0] + (/zh_cn|zh_tw/i.test($.lang.language) ? '&#65306;' : ':') + '</span>' + productAttr[1] + '</div>' );

							$.Log(productAttr[0] + ': ' + productAttr[1]);
						}else if( $.isObject(productAttr) ){
							productAttr['v'] = (k.indexOf('price')>-1&&json['currency']&&(productAttr['v']+'').indexOf(json['currency'])<=-1 ? json['currency'] : '') + '' + productAttr['v'];

							html.push( '<div style="' + $.STYLE_BODY + '"><span style="' + $.STYLE_BODY + '">' + productAttr['k'] + (/zh_cn|zh_tw/i.test($.lang.language) ? '&#65306;' : ':') + '</span>' + productAttr['v'] + '</div>' );

							$.Log(productAttr['k'] + ': ' + productAttr['v']);
						}else if( $.lang.goodsinfo[k] ){
							//添加货币符号
							productAttr = (k.indexOf('price')>-1&&json['currency']&&(productAttr+'').indexOf(json['currency'])<=-1 ? json['currency'] : '') + productAttr;

							html.push( '<div style="' + $.STYLE_BODY + '"><span style="' + $.STYLE_BODY + '">' + $.lang.goodsinfo[k] + (/zh_cn|zh_tw/i.test($.lang.language) ? '&#65306;' : ':') + ' </span>' + productAttr + '</div>' );

							$.Log($.lang.goodsinfo[k] + '' + productAttr);
						}
					});
					if(json.imageurl) $.require(json.imageurl + '#image', function(image){
						if( image.error ){
							self.chatHistory.find('.view-history-goods-image').html('');
						}else{
							attr = $.zoom(image, 75, 75);
							self.chatHistory.find('.view-history-goods-image').html('<a href="' + json.url + '" target="_blank" style="' + $.STYLE_BODY + '"><img src="' + json.imageurl + '" width="' + attr.width + '" height="' + attr.height + '" style="' + $.STYLE_NBODY + 'display:inline;width:' + attr.width + 'px;height:' + attr.height + 'px;" /></a>');
						}
						if( self.scroll ){
							self.scroll.scrollBottom();
						}
					});
					if( self.scroll ){
						self.scroll.scrollBottom();
					}
					this.chatHistory.find('.view-history-goods-info').html( html.join('') );
					break;
				case "2":
				case "4":
				    if (data.type == 2 && data.emotion == 1) {
				        //2015.02.06, 加载自定义表情
				        $.require(data.sourceurl + '#image', function(image) {
				            if (image.error) {
				                $.Log('emotion file failure.', 3);

				                if (data.msgid) self.removeMessage(data.msgid);
				            } else {
				                var attr = $.zoom(image, 100, 85);
				                bodyElement.css({
				                    'background': 'none',
				                    'cursor': 'auto',
				                    'height': attr.height + 'px'
				                }).html('<img src="' + data.sourceurl + '" sourceurl="' + data.sourceurl + '" width="' + attr.width + '" height="' + attr.height + '" style="' + $.STYLE_NBODY + 'width:' + attr.width + 'px;height:' + attr.height + 'px;vertical-align:middle;" />');
				            }
				            //$.Log('load face image, scroll.scrollBottom()');
				            if (self.scroll) {
				                self.scroll.scrollBottom();
				            }
				        });
				        if (self.scroll) {
				            self.scroll.scrollBottom();
				        }
				    } else if (data.status == 'UPLOADING') {
				        //准备上传文件

				        liElement.find('table').css('width', '138px');
				        //开始上传图片文件时，显示取消息上传提示
				        position = type == 2 ? '-115px -145px' : '0 -245px';
				        bodyElement.css({
				            'width': '100px',
				            'height': '85px',
				            'background': 'url(' + $.imageicon + ') no-repeat ' + position
				        });
				        /*
				        this._showCancel(msgid).click(function(event){
				        	self.mode.cancelUpload(type == 2 ? 'uploadimage' : 'uploadfile');
				        });
				        */
				    } else if ($.isNumeric(data) && data > 0 && data <= 100) {
				        //正在上传,更新进度条宽

				        liElement.find('.view-history-progress').display(1).find('.view-history-upload-progress').css('width', data + '%');

				    } else if (data < 0 || data.error) {
				        //上传失败、异常
				        if (type == 2) {
				            //2015.11.10 IE7 兼容处理
				            liElement.find('table').css('width', '138px');
				            //2015.11.10 图片上传失败处理
				            position = type == 2 ? '-20px -145px' : '-98px -245px';

				            bodyElement.css({
				                'width': '100px',
				                'height': '85px',
				                'background': 'url(' + $.imageicon + ') no-repeat ' + position
				            });

				            if (data == -1) { //-1:取消上传
				                this._transCancel(msgid);
				            } else { //-2: 上传失败
				                this._showFailure(msgid);
				            }
				        } else {
				            //2015.11.10 文件上传，界面响应方法
				            this._showFileUpload(liElement, bodyElement, {
				                name: '',
				                size: '',
				                error: receive
				            }, -1);
				        }

				        liElement.find('.view-history-progress').display();
				    } else if ($.isObject(data) && data.url) {
				        //文件、图片上传完成
				        if (type == 2) {
				            //2015.11.01 需要显示的图片，将msgid放入imageMsgIdArr中
				            //self.imageHash[msgid] = 0;

				            $.require(data.url + '#image', function(image) {
				                if (image.error) {
				                    $.Log('upload file failure.', 3);
				                    //IE7 兼容处理
				                    liElement.find('table').css('width', '120px');

				                    bodyElement.css({
				                        'width': '100px',
				                        'background': 'url(' + $.imageicon + ') no-repeat 0 -145px'
				                    });
				                } else {
				                    //var attr = $.zoom(image, 100, 85);
				                    //设置图片宽高为读取到的宽高
				                    var imageHtml = '<img src="' + data.url + '" sourceurl="' + data.sourceurl + '" width="' + image.width + '" height="' + image.height + '" style="vertical-align:middle;' + $.STYLE_NBODY + 'width:' + image.width + 'px;height:' + image.height + 'px;max-width:220px;max-height:160px;" />';

				                    var width = image.width,
				                        height = image.height;

				                    //当宽度或高度不足时，添加默认的白色的背景
				                    if (image.width < 138) {
				                        imageHtml = '<div style="width:138px;height:' + image.height + 'px;text-align:center;background:white;border-radius:5px;max-width:220px;max-height:160px">' + imageHtml + '</div>';
				                        width = 138;
				                    } else if (image.height < 100) {
				                        height = 100;
				                        var temp_height = (!$.browser.Quirks && ($.browser.ieversion <= 7 ))? image.height : 100;
				                        imageHtml = '<div style="height:'+temp_height+'px;width:' + image.width + 'px;box-sizing:border-box;padding:' + (100 - image.height) / 2 + 'px 0px;text-align:center;background:white;border-radius:5px;max-width:220px;max-height:160px">' + imageHtml + '</div>';

				                    }
				                    //IE7 兼容处理 宽度增大 2016.03.31
				                    liElement.find('table').css('width', ( (width < 220 ? width : 220) + 68) + 'px');


				                    //设置最大宽高
				                    $.Log('upload file(width:' + image.width + ', height:' + image.height + ') success:' + data.url);
				                    bodyElement.css({
				                        'background': 'none',
				                        'cursor': 'pointer',
				                        //2016.03.31更改高度值
				                        'width': width < 220 ? width + 'px' : '220px',
				                        'height': height < 160 ? height +'px' : '160px',
				                        'max-width': '220px',
				                        'max-height': '160px'
				                    }).html(imageHtml).find('img').click(function(event) {
				                        self._fullScreenImage(this, msgid);
				                    });


				                    //判断消息来源于访客或客服
				                    var userid = liElement.attr('userid');
				                    var dest = $.base.checkID(userid) <= 1;

				                    //访客，客服样式不同处理
				                    if (dest && userid) {
				                        bodyElement.parent().css({
				                            'padding': '2px',
				                            'border': '1px solid #ffffff'
				                        });
				                    } else {
				                        bodyElement.parent().css({
				                            'padding': '2px',
				                            'border': '1px solid #78bde9'
				                        });
				                    }

				                    //设置尖角位置为距离顶部15px
				                   //var angle = liElement.find('.view-history-angle');
				                   // angle.css('margin-left', '15px');
				                   // angle.parent().css('vertical-align', 'top');
				                    self.imageHash[msgid] = 1;

				                    //添加鼠标移入显示图片底部透明长条设置，点击长条可以下载图片
				                    if( typeof webInfoChanged != "function" ){
				                    bodyElement.bind('mouseenter', function(event) {
                                     var downloadHtml = ['<div class="mouse-enter-download" style="', $.STYLE_BODY, 'position:absolute;bottom:0px;width:100%;height:30px;line-height:30px;text-align:right;background:#000;color:white;left:0px">', $.lang.news_download, '&nbsp;&nbsp;</div>'].join("");

                                       $(this).css('position', 'relative');
				                        $(this).append(downloadHtml);
				                        $(this).find('.mouse-enter-download').css('opacity', 0.5);
				                        $(this).find('.mouse-enter-download').click(function(event) {
				                            $.Event.fixEvent(event).stopPropagation();
				                            self.displayiFrame.attr('src', data.sourceurl || data.url);
				                        });
				                    }).bind('mouseleave', function(event) {
				                        $(this).css('position', 'static');
				                        $(this).find('.mouse-enter-download').remove();
				                    });
				                    }

				                }
				                if (self.scroll) {
				                    self.scroll.scrollBottom();
				                }
				            });
				        } else {
				            //文件上传效果处理
				            this._showFileUpload(liElement, bodyElement, data, 1);
				        }
				        liElement.find('.view-history-progress').display();
				    }
				    break;
				case "6":
					//创建音频消息播放器
					var musicEl = new $.Music(msgid, data.url, 'audio/mpeg', (data.duration||data.length), this.audioView, this.audioBindEvent, this.contains);
					break;
				case "9":break;
				default:
					bodyElement.html( data );
					break;

			}
		},
		/**
		 * @method loadLinkContainer 查询加载消息区连接地址
		 * @param  {string} msgid
		 * @return {void}
		 */
		loadLinkContainer: function(msgid){
			var self = this,
				linkContains = this.chatHistory.find('.' + msgid ).last().find('.view-history-body').find('.ntalk-link-contains')
			;
			if( !linkContains.length ) return;

			linkContains.each(function(i, aElement){
				var url = $(aElement).attr('data-source');
				var selector = $(aElement).attr('class');
				if( url ){
					self.mode.loadLink(url, '.' + selector.replace(/ntalk\-link\-contains\s+/gi, ''));
				}
			});
		},
		/**
		 * @method viewLinkContainer 显示连接信息
		 * @param  {json|string} data
		 * @return {void}
		 */
		viewLinkContainer: function(data, selector){
			var self = this, root = $(selector), linkImage;

			if( typeof data == 'string' ){
				try{
					data = $.JSON.parseJSON(data);
				}catch(e){
				}
			}

			root.css({
				"margin":           "5px",
				"border-radius":    "5px",
				"border":           "1px solid #CCC",
				"background-color": "#FAFAFA",
				"width":            "250px"
			});
			linkImage = $({className:'link-image',style: $.STYLE_BODY + 'margin:10px;background-color:#fff;width:77px;height:77px;overflow:hidden;float:left;display:inline-block;'}).appendTo( root );
			container = $({className:'link-container',style: $.STYLE_BODY + 'overflow:hidden;zoom:1;'}).appendTo( root );

			$({className:'link-title',style: $.STYLE_BODY + 'margin:10px 0 0 0;width:100%;height:24px;white-space:nowrap;text-overflow:ellipsis;-o-text-overflow:ellipsis;overflow:hidden;'}).appendTo( container ).html(
				['<a href="', data.url, '" target="_blank">', data.title, '</a>'].join('')
			);

			$({className:'link-desc', style: $.STYLE_BODY + 'margin:5px 0 10px 0;width:100%;max-height:60px;overflow:hidden;'}).appendTo( container ).html( $.enCut(data.description, 96, 1) + '&nbsp;' );
			$({className:'link-clear',style: $.STYLE_BODY + 'clear:both;'}).appendTo( root );

			//load image
			$.require(data.imageurl + '#image', function(image){
				var attr = $.zoom(image, 75, 75);
				var margin = (75 - attr.height)/2 + 'px ' + (75 - attr.width)/2 + 'px';
				linkImage.html(
					['<img src="', data.imageurl, '" style="', $.STYLE_NBODY, 'margin:' + margin + ';width:' + attr.width + 'px;height:' + attr.height + 'px;"/>'].join('')
				);

				//更新滚动条
				if( self.scroll ){
					self.scroll.scrollBottom();
				}
			});
		},
		/**
		 * @method scrollBottom 消息区向下滚动
		 * @return {void}
		 */
		scrollBottom: function(){
			//this.chatHistory.scrollTop( this.chatHistory.scrollHeight() );
		},
		/**
		 * @method suggest 显示输入建议(用于机器人客服时快速提问)
		 * @param  {array}  data
		 */
		suggest: function(data, type){
			var self = this,
				list = this.chatElement.find('.chat-view-hidden-area .chat-view-suggest-list')
			;
			list.find('ul li').remove();

			if(data.length === 0) {
			    list.css('display', 'none');
			    return;
			}

			$.each(data, function(i, message){
				$({tag: 'LI', talk_index: i, className: '', style:$.STYLE_BODY + 'padding:0 0 0 20px;list-style:none;line-height:28px;height:28px;overflow:hidden;cursor:pointer;'}).appendTo(list.find('ul')).html(message).hover(function(event){
					$(this).css({
						'color':	'#fff',
						'background-color':'#4297e0'
					});
				}, function(event){
					$(this).css({
						'color':	'#000',
						'background-color':'#fafafa'
					});
				}).click(function(event){
					$.Event.fixEvent(event).stopPropagation();

					//2015.04.15 点击建议消息后发送index类型消息,值为索引
					var index = parseFloat($(this).attr('talk_index')) + 1;
					self.mode.send( {
						msg: !type ? index : message,
						botindex: 'index'
					} );
					self.textEditor.val( '' );

					list.css('display', 'none');
				});


			});

			list.css({
				'display':	'block',
				'top':		(-10 - 26*data.length) + 'px'
			});
		},
		/**
		 * @method _selectSuggest 移动输入选项位置
		 * @param  {number} num
		 */
		_selectSuggest: function(num){
			var list = this.chatElement.find('.chat-view-suggest-list li'),
				selectIndex = 0
			;
			list.each(function(){
				if( $(this).attr('talk_selected') ){
					selectIndex = $(this).attr('talk_index');
				}
				$(this).attr('talk_selected', '').css({
					'color':	'#000',
					'background-color':'#fafafa'
				});
			});

			selectIndex = parseFloat(selectIndex) + num;
			selectIndex = selectIndex < 0 ? list.length - 1 : selectIndex;
			selectIndex = selectIndex >= list.length ? selectIndex - list.length : selectIndex;
			$.Log('set selected index:' + selectIndex);

			//选中项
			list.eq(selectIndex).attr('talk_selected', '1').css({
				//2016.03.11更改颜色
				'color':	'#fff',
				'background-color':'#4297e0'
			});

			this.isRobotSuggest = false;
			this.textEditor.val( list.eq(selectIndex).attr('robotmsg') ? list.eq(selectIndex).attr('robotmsg') : (parseFloat(selectIndex)+1) );
		},
		/**
		 * 开始分配置客服时，显示正在分配客服状态消息
		 * @param  {boolean} display 显示｜隐藏状态消息
		 * @param  {string}  message 消息内容
		 * @return {void}
		 */
		displayStatusInfo: function(display, message){
			var statusElement = this.chatElement.find('.chat-view-window-status-info');
			if( message ){
				statusElement.html(message);
			}
			if( display ){
				statusElement.display(1);
			}else{
				statusElement.hide(function(){
					$(this).css({
						'display':	'none',
						'opacity':	1
					});
				});
			}
		},
		/**
		 * 客服正在输入,在聊窗中创建一条新消息占位，此消息会一直在最新位置
		 * 默认用户输入状态与默认配套背景图片关联
		 * @param  {number} position 动画更新输入状态
		 * @return {void}
		 */
		 //2016.03.23 改写聊窗内容
          showInputState:function(){
          	//2016.03.23
			  $('.chat-view-xiaoneng-version').css('visibility', 'visible');
			  if($('.chat-view-xiaoneng-version').css('visibility')=='visible'){
					clearTimeout(this._inputTimerID);
				    this._inputTimerID = null;
				    this._inputTimerID = setTimeout(function(){
					//2016.03.23
					$('.chat-view-xiaoneng-version').css('visibility', 'hidden');
			     }, 3E3);
				}

          },

		/*showInputState: function(position){
			if( this._inputStateTimeID && position === undefined ){
				return;
			}
			//2016.03.23
			position = position ? position : -140;

			var self = this, elementWait = this.chatHistory.find('.view-history-body-wait');
			this._inputStateTimeID = setTimeout(function(){

				if( !elementWait.length ){
					clearTimeout( self._inputStateTimeID );
					self._inputStateTimeID = null;
					return;
				}

				position = position <= -170 ? -140 : position - 10;
				elementWait.css('background-position', position + 'px -60px');

				self.showInputState(position);
			}, 5E2);
		},*/
		/**
		 * @method _showResend 显示重新发送消息
		 * @param  {string} msgid 消息ID
		 * @param  {string} msg   消息内容
		 * @return {void}
		 */
		_showResend: function(msgid, msg){
			this.chatHistory.find('.' + msgid).last().find('.view-history-status').display(1);
			this.chatHistory.find('.' + msgid).last().find('.view-history-status-icon').display(1);
			return this.chatHistory.find('.' + msgid).last().find('.view-history-status-link').html( $.utils.handleLinks( msg || $.lang.news_send_failure ) ).find('a');
		},
		/**
		 * @method _showCancel 显示取消文件上传消息
		 * @param  {string}  msgid   消息ID
		 * @param  {boolean} receive 是否是接收消息
		 * @return {void}
		 */
		_showCancel: function(msgid, receive){
			this.chatHistory.find('.' + msgid).last().find('.view-history-status').display(1);
			this.chatHistory.find('.' + msgid).last().find('.view-history-status-icon').display();
			return this.chatHistory.find('.' + msgid).last().find('.view-history-status-link').html('<span style="' + $.STYLE_BODY + 'cursor:pointer;color:#005ffb;text-decoration:none;">' + ($.lang.news_cancel_trans || '') + '</span>').find('span');
		},
		/**
		 * @method _showDownload 显示文件下载连接与文件名
		 * @param  {string}  msgid   消息ID
		 * @param  {boolean} receive 是否是接收消息
		 * @param  {json}    data    消息内容
		 * @return {HtmlDom}
		 */
		_showDownload: function(msgid, receive, data){
			var html, filename = data.type==4&&data.oldfile ? data.oldfile : '';
			html = receive ? [
				'<span class="chat-view-download-link" style="' + $.STYLE_BODY +  'float:left;line-height:26px;margin:0 5px;cursor:pointer;color:#005ffb;text-decoration:none;">' + $.lang.news_download + '</span>',
				(filename ? '<span style="' + $.STYLE_BODY + 'float:left;line-height:26px;text-decoration:none;display:block;white-space:nowrap; overflow:hidden; text-overflow:ellipsis;max-width:100px;" title="' + filename + '">' + this._toFileName(filename) + '</span>' : '')
			].join('') : [
				(filename ? '<span style="' + $.STYLE_BODY + 'float:left;line-height:26px;text-decoration:none;display:block;white-space:nowrap; overflow:hidden; text-overflow:ellipsis;max-width:100px;" title="' + filename + '">' + this._toFileName(filename) + '</span>' : ''),
				'<span class="chat-view-download-link" style="' + $.STYLE_BODY +  'float:left;line-height:26px;margin:0 5px;cursor:pointer;color:#005ffb;text-decoration:none;">' + $.lang.news_download + '</span>'
				].join('');

			this.chatHistory.find('.' + msgid).last().find('.view-history-status').display(1);

			this.chatHistory.find('.' + msgid).last().find('.view-history-status-icon').display();
			return this.chatHistory.find('.' + msgid).last().find('.view-history-status-link').html(html).find('.chat-view-download-link');
		},
		_toFileName: function(fName){
			fName = fName || '';
			return $.enLength(fName) < 16 ? fName : $.enCut(fName, 10) + '..' + fName.substr(fName.length-4, 4);
		},
		_showFailure: function(msgid){
			this.chatHistory.find('.' + msgid).last().find('.view-history-status').display(1);
			this.chatHistory.find('.' + msgid).last().find('.view-history-status-icon').display(1);
			return this.chatHistory.find('.' + msgid).last().find('.view-history-status-link').html($.lang.news_trans_failure);
		},
		_transCancel: function(msgid){
			this.chatHistory.find('.' + msgid).last().find('.view-history-status').display(1);
			this.chatHistory.find('.' + msgid).last().find('.view-history-status-icon').display(1);
			return this.chatHistory.find('.' + msgid).last().find('.view-history-status-link').html($.lang.news_trans_cancel);
		},
		_showFileUpload: function(liElement, bodyElement, data, type) {
			var self = this;

			//IE7下布局调整
			liElement.find('table').css('width', '293px');
			liElement.find('table').css('height', '104px');
			bodyElement.css('height', '104px');
			//bodyElement.css('width','211px');


			//分别设置访客v_、客服d_,宽度、高度、边界、距离左侧、顶部距离
			var v_width = 265, v_height = [104, 76, 28], v_border = 'none', v_left = [11, 78], v_top = [8, -44];
			//2016.03.30 更改border 的颜色值
			var d_width = 270, d_height = [110, 80, 30], d_border = '1px solid #ffffff', d_left = [13, 80], d_top = [10, -42];

			//获取消息来源于访客还是客服
			var userid = liElement.attr('userid');
			var dest = $.base.checkID(userid) <= 1;

			//将样式配置参数赋值给指定的变量
			var width, height, border, left, top;
			if (dest && userid) {
				width = d_width;
				height = d_height;
				border = d_border;
				left = d_left;
				top = d_top;
			} else {
				width = v_width;
				height = v_height;
				border = v_border;
				left = v_left;
				top = v_top;
			}

			//左侧iconurl与其样样式
			var iconurl = "", iconStyle = "";

			//data.oldfile||data.size用于获取历史消息中的文件名与大小信息
			//this.uploadFileSize||this.uploadFileName用于获取上传时的文件名与大小信息
			var oldfile = data.oldfile || this.uploadFileName,
				filename = data.oldfile || this.uploadFileName,
				size = !this.uploadFileSize ? (data.size ? parseInt(data.size.replace("KB","")) : '') : (this.uploadFileSize / 1024).toFixed(2);

			//后缀名正则，匹配后得到hzm数组
			var hzmPattern = /\.[^\.]+$/,
				hzm =  filename.toLowerCase().match(hzmPattern);

			//后缀标识
			var imgFlag = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.pjpeg'],
				docFlag = ['.doc', '.docx'],
				mp3Flag = ['.mp3'],
				txtFlag = ['.txt'];

			if ( $.inArray(hzm[0], imgFlag) > -1 ) {
				//图片时，需要在图标区域直接显示一张小图
				iconurl = data.url || '\'\'';
				iconStyle = ' width=50 height=50 style="border: 1px solid #d4d4d4;border-radius:5px;margin:2px"';
			} else if ( $.inArray(hzm[0], mp3Flag) > -1 ) {
				//设置左侧图标为MP3
				iconurl = $.sourceURI + 'images/filetype/mp3.png';
			} else if ( $.inArray(hzm[0], docFlag) > -1 ) {
				//设置左侧图标为DOC
				iconurl = $.sourceURI + 'images/filetype/doc.png';
			} else if ( $.inArray(hzm[0], txtFlag) > -1 ) {
				//设置左侧图标为TXT
				iconurl = $.sourceURI + 'images/filetype/txt.png';
			} else {
				//设置左侧图标为ZIP
				iconurl = $.sourceURI + 'images/filetype/zip.png';
			}

			//文件名超过一行的情况下，进行截取
			if ( filename.length > 12 ) {
				filename = filename.substr(0, 4) + "..." + filename.substr(filename.length-6, filename.length);
			}

			//文件大小使用适合的单位表示
			if ( !size ) {
				size = '';
			}else if ( size > 1024 ) {
				size = '(' + (size / 1024).toFixed(2) + " MB" + ')';
			} else if ( size < 1024 ) {
				size = '(' + size + " KB" + ')';
			}

			//上传状态
			var success = (type == 1);
			//状态样式
			var statusStyle = (dest && userid) ? ' display:none ' : '';
			//所需图标在大图中的位置
			//2016.03.30修改图片的位置
			var statusIconPosition = success ? ' -10px -96px ' : ' -10px -116px ';
			//显示状态名称
			var status =  success ? $.lang.news_trans_success : $.lang.news_trans_failure;
			//下载区域显示内容
			var download =  success ? $.lang.news_download : '';

            //文件上传html:结构 body{top:{icon, content: {title,size,status,status-icon}}, bottom:{bottom}}
            var width=($.browser.ieversion == 7 )? (width-42): width;
			var html = ['<div class="view-fileupload-body" style="',$.STYLE_BODY,'position:relative;width:',width,'px;height:',height[0],'px;border-radius:5px;background:#FFF;border:',border,'">',
				'<div class="view-fileupload-body-top" style="',$.STYLE_BODY,'width:',width,'px;height:',height[1],'px;border-bottom:1px solid #e2e2e2">',
					'<div class="view-fileupload-type-icon" style="',$.STYLE_BODY,'position:relative;width:54px;height:54px;top:',top[0],'px;left:',left[0],'px"><img src=',iconurl + iconStyle ,' /></div>',
					'<div class="view-fileupload-content" style="',$.STYLE_BODY,'position:relative;width:170px;height:54px;top:',top[1],'px;left:',left[1],'px;text-align:left">',
						'<span class="view-fileupload-title" title=',oldfile,' style="',$.STYLE_BODY,'cursor:pointer;color:#333333;font-size:12px;font-weight:bold;">',filename,'</span>',
						'<span class="view-fileupload-size" style="',$.STYLE_BODY,'color:#666666;font-size:12px">',size,'</span>',
						'<div class="view-fileupload-status" style="',$.STYLE_BODY + statusStyle,'position:relative;top:5px;left:-2px;color:#333333;font-size:12px">',status,'</div>',
						'<div class="view-fileupload-status-icon" style="',$.STYLE_BODY + statusStyle,'position:relative;width:20px;height:20px;top:-2px;left:-25px;background:url(',$.imageicon,') no-repeat ',statusIconPosition,'"></div>',
					'</div>',
				'</div>',
				'<div class="view-fileupload-body-bottom" style="',$.STYLE_BODY,'position:relative;width:',width,'px;height:',height[2],'px">',
					'<div class="view-fileupload-download" style="',$.STYLE_BODY,'width:auto;height:',height[2],'px;line-height:',height[2],'px;font-size:12px;color:#0681D7;text-align:right;margin-right:35px;cursor:pointer">',download,'</div>',
				'</div>',
			'</div>'].join("");

			bodyElement.append(html);
			//消息发送人不同，设置不同的bodyElement样式
			if (dest && userid) {
				bodyElement.parent().css({
					'padding': '0px',
					'border': 'none'
				});
			} else {
				bodyElement.parent().css({
					'padding': '2px',
					'border': '1px solid #78bde9'
				});
			}
			//尖角距离顶部15px
			var angle = liElement.find('.view-history-angle');
			//2016.03.30修改样式top值
			angle.css('margin-top', '0px');
			angle.parent().css('vertical-align', 'top');
			//原有的状态栏不显示
			liElement.find('.view-history-status-link').last().display(0);
			liElement.find('.view-history-status').last().display(0);
			//上传失败的消息提醒
			if ( !success ) {
				if ( data.error.maxSize ) {
					data.error.error = $.utils.handleLinks($.lang.news_trans_failure_size, {maxsize: data.error.maxSize / (1024 * 1024)});
				} else if ( data.error.ext ) {
					data.error.error = $.utils.handleLinks($.lang.news_trans_failure_type, {type: data.error.ext});
				}
				self.showMessage('system', {
					type:	9,
					msg:	'<span style="display:inline-block;width:20px;height:20px;position:relative;top:5px;background: url(' + $.imageicon + ') no-repeat ' + statusIconPosition + '"></span>' + data.error.error
				});
			}
			//下载按钮绑定下载事件
			bodyElement.find('.view-fileupload-download').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				if ( success ) {
					if( typeof openURLToBrowser == "function" ){
						openURLToBrowser(data.sourceurl || data.url);
					}else{
					self.displayiFrame.attr('src', data.sourceurl || data.url);
				}
				}
			});
		},
		/**
		 * 获取输入框中光标位置
		 * @param  element input
		 * @return {number}
		 */
		_getPositionForTextArea: function(input){
			var start = 0;
			if( document.selection ){
				input.focus();
				var rang = document.selection.createRange();
				var dup = rang.duplicate();
				try{
					dup.moveToElementText(input);
				}catch(e){
				}
				start = -1;
				while (dup.inRange(rang)) {
					dup.moveStart('character');
					start++;
				}
			}else if( input.selectionStart || input.selectionStart == '0' ){
				start = input.selectionStart;
			}
			return start;
		},
		/**
		 * 设置光标栏置
		 * @param {HTMLDOM} input
		 * @param {number}  pos
		 */
		_setCursorPosition: function(input, pos){
			this._editorStart = pos;
			if(input.setSelectionRange){
				input.focus();
				input.setSelectionRange(pos, pos);
			}else if (input.createTextRange) {
				var range = input.createTextRange();
				range.collapse(true);
				range.moveEnd('character', pos);
				range.moveStart('character', pos);
				range.select();
			}
		},
		/**
		 * 插入消息内容、表情符号到输入框
		 * @param  {HTMLDOM} input 输入框对像引用
		 * @return {void}
		 */
		_insertText: function(content){
			var input = this.textEditor.get(0),
				text = input.value == $.lang.default_textarea_text ? '' : input.value,
				start = Math.min(text.length, this._editorStart)
			;
			start = start < 0 ? text.length : start;
			input.value = text.substr(0, start) + content + text.substr(start, text.length);
			if( !$.browser.mobile ){
				this._setCursorPosition(input, start + content.length);
				input.focus();
			}
		},
		/**
		 * @method createEvaluation 评价窗口内容
		 * @param  {json}   formOptions 表单配置项
		 * @param  {string} title       标题
		 * @param  {string} startColor  颜色
		 * @param  {string} endColor    颜色
		 * @param  {function} callback  回调
		 * @return {HTMLDOM}
		 */
		createEvaluation: function(formOptions, title, startColor, endColor, callback){
			var self = this,
				dialogElement,
				html = [
				'<div class="ntkf-alert-close" style="' + $.STYLE_NBODY + 'cursor:pointer;height:20px;position:absolute;right:5px;top:9px;width:20px;background:url(' + $.imageicon + ') no-repeat scroll -60px -61px;-moz-border-radius:0px;-webkit-border-radius:0px;border-radius:0px;"></div>',
				'<table border="0" cellpadding="0" cellspacing="0" style="' + $.STYLE_NBODY + 'margin:0px 0 10px 0;width:100%;table-layout:auto;border-collapse:separate;">',
				'<tbody style="', $.STYLE_NBODY, '">',
				'<tr style="',$.STYLE_NBODY,'">',
				'<td class="chat-view-evaluation-title" colspan="2" style="',$.STYLE_BODY,'text-align:center;height:39px;color:#fff;">',
				'<span style="',$.STYLE_BODY,'color:#000;font-weight:bold;font-size:14px;vertical-align:middle;">' + title + '</span>',
				'</td></tr>',
				$.FORM.createInput(formOptions),
				'<tr style="',$.STYLE_NBODY,'">',
					'<td colspan="2" style="',$.STYLE_BODY,'padding:5px 0;text-align:center;color:#333;">',
						'<input type="button" class="view-alert-submit" value="' + $.lang.evaluation_button_submit + '" style="' + $.STYLE_BODY + 'padding:0 15px;border:1px solid #878787;background:#ebe9e9;height:28px;color:#333;line-height:24px;" />',
					'</td></tr>',
					'</tbody>',
				'</table>'
			].join('');

			if( !this.evalDialog ){
				this.evalDialog = new $.DialogChat(html, {
					margin: 2,
					border: 3,
					style:  {
						border: '3px solid #00ACFF',
						height: 'auto'
					},
					parent: this.chatElement.get(0)
				});
			}
			dialogElement = this.evalDialog.container;

			//输入框可输入字符数提示
			for(var areaElement, i=0; i<formOptions.length; i++){
				if( formOptions[i].type == 'textarea' ){
					areaElement = dialogElement.find('table textarea[name=' + formOptions[i].name + ']').parent();
					//2014.11.26 输入字数提示节点需要父级节点为相对定位
					areaElement.css('position', 'relative');
					$({className: 'textarea-' + formOptions[i].name, maxsize: formOptions[i].max, style: $.STYLE_BODY + 'font-size:16px;font-weight:bold;color:#ccc;float:right;position:absolute;right:15px;top:70px;'}).appendTo( areaElement ).html('0/' + formOptions[i].max);
				}
			}
			dialogElement.find('table textarea').bind('keyup', function(event){
				var selector = 'table .textarea-' + $(this).attr('name');
				var color  = $.enLength($(this).val()) > dialogElement.find(selector).attr('maxsize') ? '#f00' : '#ccc';
				var inputText= $.enLength($(this).val()) + '/' + dialogElement.find(selector).attr('maxsize');

				dialogElement.find(selector).html( inputText ).css('color', color);
			});

			//bind form event
			$.FORM.bindFormEvent(formOptions, dialogElement);

			//set evaluation form focus
			dialogElement.find('input[type!=hidden],textarea').get(0).focus();

			dialogElement.find('.ntkf-alert-close').click(function(event){
				self.evalDialog.close();
				self.evalDialog = null;
			});
			dialogElement.find('.view-alert-submit').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				//2016.02.14 预防重复点击评价
				if(self.evalRepeatClick){
					self.evalRepeatClick = false;
				self.mode.submitEvaluationForm(function(){
					if( $.isFunction(callback) ) callback();

					self.evalDialog.close();
					self.evalDialog = null;
						self.evalRepeatClick = true;
				});
				}


				//self._hiddenDialog();
			}).gradient("top", '#f5f5f5', '#ffffff');
			//应该标题栏皮肤样式
			dialogElement.find('.chat-view-evaluation-title').gradient("top", '#ffffff', '#f5f5f5');//startColor, endColor

			return dialogElement.get(0);
		},
		/**
		 * @method createFileButton 创建文件、图片上传按钮
		 * @param  {json} server 服务器地址集合
		 */
		createFileButton: function(server){
			//去掉脚本中MAXSIZE的传值
			this.objFile = this._createUpload(server, 'uploadfile', this.contains.find('.chat-view-file'));
			this.objImage = this._createUpload(server, 'uploadimage', this.contains.find('.chat-view-image'), 'image/jpg,image/png,image/gif,image/jpeg');
		},
		/**
		 * 创建文件图片上传节点
		 * @param  {json}        server   服务器地址
		 * @param  {string}      options  配置选项
		 * @param  {HTMLElement} parent   父级节点对像
		 * @param  {Number}      maxSize  允许上传的最大文件
		 * @param  {String}      accept   允许上传的文件
		 * @return {objTransfer}
		 */
		_createUpload: function(server, action, parent, maxSize, accept){
			var self = this;
			var options = {
				action: action,
				roomid: 'T2D',
				siteid: this.siteid,
				settingid:this.settingid,
				charset:$.charset
			};
			return !server.filetranserver ? null : new $.Transfer({
				server:	server.filetranserver + '/imageupload.php',
				name:	'userfile',
				maxSize:maxSize,
				accept:	accept,
				params:	options,
				onError:  function(result){
					//上传文件失败:类型不支持、超出最尺寸
					var chat = $.chatManage.get(options.settingid);
					chat && chat.uploadFailure(options.action, result);
				},
				onChange: function(data){
					//记录此次上传的文件名和大小
					self.uploadFileName = data.name;
					self.uploadFileSize = data.size;
				},
				callback: function(result){
					$.Log(options.settingid + '::jsonp: ' + $.JSON.toJSONString(result));

					var chat = $.chatManage.get(options.settingid);

					if( result.result == -2 || result.type == 9 ){
						//$.fIM_receiveUploadFailure('', options.action, {name: '', error: result.error}, options.settingid);
						chat && chat.uploadFailure(options.action, result);
					}else{
						//$.fIM_startSendFile('', options.action, result.oldfile, options.settingid);
						chat && chat.startUpload(options.action, result.oldfile);

						setTimeout(function(){
							//$.fIM_receiveUploadSuccess('', options.action, result, options.settingid);
							chat && chat.uploadSuccess(options.action, result);
						});
					}
				}
			}, parent);
		},
		/**
		 * 创建留言表单
		 * @param  {json}    formOptions     表单配置
		 * @param  {boolean} disableMessage  关闭留言
		 * @param  {string}  announcement    公告内容
		 * @param  {json}    data            表单默认数据
		 * @return {void}
		 */
		createMessageForm: function(formOptions, disableMessage, announcement, data){
			var self = this, html, td, tr, announHeight = 0;

			//进入留言，关闭评价弹窗
			if( this.evalDialog ){
				this.evalDialog.close();
				this.evalDialog = null;
			}

			if( this.messageElement.find('.chat-view-message-table table').length){
				return;
			}

			if( announcement ){
				announHeight = this.messageElement.find('.chat-view-message-announcement').html(announcement).display(1).height() + 20;
			}

			//set message div\style
			for(var i=0; i<formOptions.length; i++){
				formOptions[i] = $.extend(formOptions[i], {
					titlewidth:	/zh_cn|zh_tw/ig.test( $.lang['language'] ) ? '80px' : '140px',
					inputwidth: 'auto',
					input:{
						width:'90%',
						height:(formOptions[i].type=='textarea' ? '140px' : 'auto')
					},
					messageid:'chat-view-message-' + formOptions[i].name
				});
			}

			this.messageElement.find('.chat-view-submit-submit').gradient("top", '#f5f5f5', '#ffffff');
			this.messageElement.find('.chat-view-message-body').css('height', (this.messageElement.height() - announHeight) + 'px');
			this.messageElement.find('.chat-view-message-table').html( [
				'<table cellspacing="0" cellpadding="0" border="0" style="',$.STYLE_BODY,'margin:20px 0 0 0;width:100%;table-layout:auto;border-collapse:separate;">',
				'<tbody style="',$.STYLE_NBODY,'">',
				(disableMessage ?
					'' :
					[$.FORM.createInput( formOptions, null, $.lang.message_no_null ),
					'<tr style="',$.STYLE_NBODY,'">',
					'<td colspan="2" style="',$.STYLE_BODY,'text-align:center;padding:10px 0px 10px;color:#090;">',
						'<input style="' + $.STYLE_BODY + 'text-align:center;padding:0 20px;margin:0 auto;border:1px solid #878787;height:28px;color:#000;line-height:26px;" type="button" class="chat-view-button chat-view-submit-submit" value="' + $.lang.message_button_submit + '">',
						'<span class="submit_message_complete" style="',$.STYLE_BODY,'text-align:center;color:#090;display:none;">', $.lang['message_success'], '</span>',
					'</td></tr>'].join('')),
				'</tbody></table>'
			].join('') );

			this.messageElement.find('input[name=myuid]').val( data.myuid );
			this.messageElement.find('input[name=destuid]').val( data.destid );
			this.messageElement.find('input[name=ntkf_t2d_sid]').val( data.sessionid );
			this.messageElement.find('input[name=source]').val( data.source  );
			this.messageElement.find('input[type=text],textarea,select').css('color', '#ccc').attr('disabled', '');

			if( data.fileError ){
				//文件、图片上传后未激活聊窗(未连上TChat)
				tr = $({tag:'tr', style: $.STYLE_NBODY}).appendTo( this.messageElement.find('.chat-view-message-table tbody'), this.messageElement.find('.chat-view-message-table tbody tr').eq(-1) );
				td = $({tag:'td', style: $.STYLE_NBODY}).appendTo(tr);
				td = $({tag:'td', style: $.STYLE_NBODY}).appendTo(tr).html( [
					'<div style="',$.STYLE_BODY,'display:block;color:#ef7208;">',
						'<div style="',$.STYLE_BODY,'margin:2px;width:15px;height:15px;float:left;background:url(',$.imageicon,') no-repeat -160px -39px;"></div>',
						'<div style="',$.STYLE_BODY,'float:left;" class="chat-view-info">',$.lang.message_upload_failure,'</div>',
						'<div style="',$.STYLE_NBODY,'clear:both;height:0;width:0;"></div>',
					'</div>'
				].join('') );
			}

			this.messageElement.find('.chat-view-submit-submit').show(function(){
				$(this).css('display', $.browser.oldmsie ? 'inline-block' : 'block');
			});
			this.messageElement.find('.submit_message_complete').display();

			//bind event
			$.FORM.bindFormEvent(formOptions, this.messageElement);

			this.messageElement.find('.chat-view-submit-submit').click(function(event){
				self.mode.submitMessageForm();
			});
			//连接服务器失败时，消息放入留言框(默认留言表单只有一个多行文本框)
			this.messageElement.find('textarea').val( data.content );
		},
		/**
		 * 提交留言表单
		 * @param  {json}    formOptions     表单配置
		 * @param {string}   actionUrl       提交地址
		 * @return {void}
		 */
		submitMessageForm: function(formOptions, actionUrl){
			var self = this;

			$.FORM.verificationForm(formOptions, function(){
				self.messageElement.find('.chat-view-message-form').attr('action', actionUrl);
				self.messageElement.find('.chat-view-message-form').get(0).submit();
				$.Log('chatView.submitMessageForm complete', 1);

				self.messageElement.find('input[type=text],textarea,select').attr("disabled", true);
				self.messageElement.find('.chat-view-submit-submit').display();
				self.messageElement.find('.submit_message_complete').css('display', 'block');
			}, this.messageElement);
		},
		/**
		 * 全屏查看图片
		 * @param ImageDOM image
		 * @msgid 此张图片的msgid
                 * debug
		 */
		_fullScreenImage: function(image, msgid) {
		    var self = this,
		        container = this._createfullScreen(image),
		        src = $(image).attr('sourceurl') || image.src,
		        downloadImage = function() {
		            $.Log('download image ' + src);
		            if( typeof openURLToBrowser == "function" ){
		            	openURLToBrowser(src);
		            }else{
		            	self.displayiFrame.attr('src', src);
		            }
		        };

		    $.Log(this.settingid + ':chatView._fullScreenImage(), src:' + src, 1);

		    $('.view-fullScreen-background').css('opacity', 0.6);
		    container.click(function(event) {
		        $.Event.fixEvent(event).stopPropagation();
		        self._hideScreenImage();
		    }).find('.view-fullScreen-close').click(function(event) {
		        $.Event.fixEvent(event).stopPropagation();
		        self._hideScreenImage();
		    });

		    //如果不是第一次进入此方法，需要先移除左右翻页的按钮下的绑定的事件
		    if (this.nextClick && this.prevClick) {
		        container.find('.view-next-picture').removeEvent('click', this.nextClick);
		        container.find('.view-prev-picture').removeEvent('click', this.prevClick);
		    }

		    //下一张图片
		    this.nextClick = function(event) {
		        $.Event.fixEvent(event).stopPropagation();
		        var nextMsgId = 0;
		        var timeSub = 10000000;
		        for (hashMsgId in self.imageHash) {
		            var hashTime = parseInt(hashMsgId.substr(0, msgid.length - 1))
		            var time = parseInt(msgid.substr(0, msgid.length - 1));
		            if (hashTime - time > 0 && hashTime - time < timeSub) {
		                nextMsgId = hashMsgId;
		                timeSub = (hashTime - time);
		            }
		        }
		        if (nextMsgId == 0) {
		            self._hideScreenImage();
		        } else {
		            self._fullScreenImage($('.' + nextMsgId).find('.view-history-body').find('img'), nextMsgId);
		        }
		    };


		    //上一张图片
		    this.prevClick = function(event) {
		        $.Event.fixEvent(event).stopPropagation();
		        var lastMsgId = 0;
		        var timeSub = -10000000;
		        for (hashMsgId in self.imageHash) {
		            var hashTime = parseInt(hashMsgId.substr(0, msgid.length - 1))
		            var time = parseInt(msgid.substr(0, msgid.length - 1));
		            if (hashTime - time < 0 && hashTime - time > timeSub) {
		                lastMsgId = hashMsgId;
		                timeSub = (hashTime - time);
		            }
		        }
		        if (lastMsgId == 0) {
		            self._hideScreenImage();
		        } else {
		            self._fullScreenImage($('.' + lastMsgId).find('.view-history-body').find('img'), lastMsgId);
		        }
		    };

		    container.find('.view-next-picture').addEvent('click', this.nextClick);
		    container.find('.view-prev-picture').addEvent('click', this.prevClick);

		    container.find('.view-fullScreen-download').removeEvent('click', downloadImage).bind('click', downloadImage);
		    $(document).bind('keypress', function(event) {
		        if ($.Event.fixEvent(event).keyCode != 27) {
		            return;
		        }
		        self._hideScreenImage();
		    });
		    $(window).bind('resize', function(event) {
		        $('.view-fullScreen-background,.view-fullScreen-iframe,.view-fullScreen-container').css({
		            width: $(window).width() + 'px',
		            height: $(window).height() + 'px'
		        });
		    });

		    if (container.find('img').attr('src') == src) {
		        return;
		    }
		  	container.find('td').css({
	             	'background':'url('+ $.loadingGif + ') no-repeat center center'
	                  });

		    $.require(src + '#image', function(element) {
		        $.Log('nTalk._fullScreenImage() width:' + element.width + ', height:' + element.height);
		        var maxw = $(window).width(),
		            maxh = $(window).height(),
		            attr = $.zoom(element, maxw - 100, maxh);
                  //2016.03.29 加载条隐藏
			   	container.find('td').css({
	             	'background':'url('+ $.loadingGif + ') no-repeat center center'
	                  });

		        //由于container中添加了左右按钮，改为append
		        container.find('td').append('<img src="' + src + '" width="' + Math.floor(attr.width) + '" height="' + Math.floor(attr.height) + '" style="' + $.STYLE_NBODY + 'margin:0 auto;" />');
		         //2016.03.29 加载条隐藏
			     if(container.find('td img')){
			     	container.find('td').css({
	             	'background-image':''
	                  });
			     }
		    });


		},
		/**
		 * 关闭全屏图片查看
		 * @param ImageDOM image
		 */
		_hideScreenImage: function(){
			$('.view-fullScreen-container,.view-fullScreen-background,.view-fullScreen-iframe').display();
		},
		/**
		 * 创建全屏图片查看视图
		 * @return {void}
		 */
		_createfullScreen: function(){
			var self = this,
				width = $(window).width(),
				height = $(window).height();

			if( !$('.view-fullScreen-iframe').length ){
				$({tag:'iframe', className: 'view-fullScreen-iframe', style:$.STYLE_NBODY + 'display:none;width:' + width + 'px;height:' + height + 'px;'}).appendTo(true).fixed();
			}
			if( $('.view-fullScreen-background').length ){
				$('.view-fullScreen-background').display(1);
			}else{
				$({className: 'view-fullScreen-background', style: $.STYLE_NBODY + 'background:#000;opacity:0.6;filter:alpha(opacity=60);width:' + width + 'px;height:' + height + 'px;position:absolute;top:0;left:0;z-index:2000000000;'}).appendTo(true).fixed();
			}
			if( $('.view-fullScreen-container').length ){
				//2014.09.25 全屏查看图片时，清除上一次图片
				$('.view-fullScreen-container img').remove();
				//2016.03.29 增加第二次打开图片时的设置
				 if($('.view-fullScreen-container').width()!=width){

                    $('.view-fullScreen-container').css('width', width+'px');
                }
                if($('.view-fullScreen-container').height()!=height){
                	$('.view-fullScreen-container').css('height', height+'px');
                }
				$('.view-fullScreen-container').display(1);
			}else{
				$({className: 'view-fullScreen-container', style:$.STYLE_NBODY + 'width:' + width + 'px;height:' + height + 'px;text-align:center;position:absolute;top:0px;left:0;z-index:2000000001;'}).appendTo(true).html([
				'<table style="',$.STYLE_NBODY,'width:100%;height:100%;table-layout:auto;border-collapse:separate;">',
					'<tbody style="',$.STYLE_NBODY,'">',
					'<tr style="',$.STYLE_NBODY,'">',
					'<td valign="middle" align="center" style="',$.STYLE_NBODY,'text-align:center;vertical-align:middle;background:url(',$.loadingGif,') no-repeat center center;">',
					//添加前后翻页按钮
					'<div class="view-prev-picture" style="',$.STYLE_NBODY,'-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;position:absolute;width:50px;height:100%;bottom:0px;top:0px;left:0px">',
					'<div style="position:relative;width:50px; height:40px;top:' + ($(window).height() - 40)/2 + 'px;background:url(',$.imageicon,') no-repeat -225px -92px"></div>',
					'</div>',
					'<div class="view-next-picture" style="',$.STYLE_NBODY,'-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;position:absolute;width:50px;height:100%;bottom:0px;top:0px;right:0px">',
					'<div style="position:relative;width:50px; height:40px;top:' + ($(window).height() - 40)/2 + 'px;background:url(',$.imageicon,') no-repeat -178px -92px"></div>',
					'</div>',
					'</td></tr></table>',
					'<span class="view-fullScreen-close" style="',$.STYLE_NBODY,'position:absolute;width:28px;height:28px;margin:20px 20px 0 0;top:0;right:0;cursor:pointer;background:url(',$.imageicon,') no-repeat scroll -259px 0;z-index:2000000001;"></span>',
					'<span class="view-fullScreen-download"  style="',$.STYLE_NBODY,'position:absolute;width:28px;height:28px;margin:20px 20px 0 0;top:0;right:50px;cursor:pointer;background:url(',$.imageicon,') no-repeat scroll -219px 0;z-index:2000000001;"></span>'
				].join('')).fixed();
			}

			return $('.view-fullScreen-container');
		},
		/**
		 * 聊窗消息模板
		 * @param  {string} type 模板类型
		 * @param  {json}   data 消息类型
		 * @return {void}
		 * 调整样式，支持多语言
		 */
		_getMessageHtml: function(type, data){
			var l, fix = '';
			var systemMsgLength = $.browser.oldmsie ?  Math.min($.enLength($.clearHtml(data.msg)) * 6, 340) + 'px' : 'auto';
			if( type === 'otherinfo' ){
				type = 'left';
				data.logo = $.themesURI+'/zu_1000.jpg';
				data.userid = '';
				data.name = '';
				data.msg = [//faq信息
					'<h1 style="',$.STYLE_BODY,'">',
					'<span style="',$.STYLE_NBODY,'float:left;margin-right:5px;width:15px;height:15px;background:transparent url(',$.imageicon,') no-repeat -199px -38px;"></span>',
					'<span style="',$.STYLE_BODY,'font-weight:bold;">',data.title,'</span>',
					'<br style="',$.STYLE_NBODY,'clear:both;" />',
					'</h1>',
					'<p style="',$.STYLE_BODY,'">', data.msg, '</p>'
				].join('');
			}

			if(data.type == 7) data.type = 1;

			return type === 'right' ?
				[//发送的消息
					'<table style="',$.STYLE_NBODY,'float:right;_float:none;border-collapse:separate;" class="view-history-right" cellpadding="0" cellspacing="0" border="0" class="table">',
						'<tbody style="',$.STYLE_NBODY,'text-align:right;">',
							'<tr style="',$.STYLE_NBODY,'">',
							//2016.03.11更改颜色更改border 顏色值 添加color 值if(data.type == 7) data.type = 1;
								'<td class="view-history-content" style="',$.STYLE_BODY,'padding:8px;background:#00C3F5;border-radius:2px;-moz-border-radius:2px;-webkit-border-radius:2px;">',
									'<div class="view-history-body" style="min-height:16px;',$.STYLE_BODY,(/^(2|4)$/i.test(data.type)&&!data.emotion ? 'text-align:center;display:table-cell;*display:inline-block;vertical-align:middle;/*width:100px;*/min-height:50px;height:85px;*font-size:0px;*line-height:0px;*font-family:MicrosoftYaHei;' : 'display:block;/*width:100%;*/'),'word-break:break-all;word-wrap:break-word;',
									(data.type == 1 ? 'color:#' + data.color + ';font:'+(data.italic=="true" ? 'italic' : 'normal')+' '+(data.bold=="true" ? 'bold' : 'normal')+' ' + data.fontsize + 'px/16px MicrosoftYaHei,SimSun;font-size:12px;color:#ffffff;text-decoration:' + (data.underline=="true" ? 'underline' : 'none') + ';' : ''),
									'">',
									((/^(1|9)$/i.test(data.type))
									? data.msg
									: data.type==6
										? ['<div style="' + $.STYLE_NBODY + 'width:200px;height:36px;overflow:hidden;">',
										'<div class="view-history-audio" style="',$.STYLE_BODY,'float:left;min-width:1px;height:36px;overflow:hidden;">',
										'<video controls="controls" width="200" height="36" style="' + $.STYLE_NBODY + 'width:200px;height:36px;" src="',
										($.browser.opera || $.browser.firefox ? data.url : data.sourceurl),
										'"></video></div>',
										'</div>'].join('')
										:''),
									'</div>',
									'<div class="view-history-progress" style="',$.STYLE_NBODY,'display:none;border-top:1px solid #30c2fd;background:#fff;height:5px">',
										'<div class="view-history-upload-progress" style="',$.STYLE_NBODY,'height:5px;width:20%;background:#30c2fd;"></div>',
									'</div>',
								'</td>',
								'<td style="',$.STYLE_NBODY,'width:10px;vertical-align:top;overflow:visible;">',

									//尖角添加className
									'<div class="view-history-angle" style="',$.STYLE_NBODY,'position:relative;left:-1px;z-index:1;width:10px;height:18px;background:url(',$.imageicon,') no-repeat -1px -62px;"></div>',//

								'</td>',
								'<td style="',$.STYLE_NBODY,'width:54px;vertical-align:top;overflow:visible;">',
								//2016.03.31更改样式增加td//2016.03.18增加头像
								   '<div style="',$.STYLE_NBODY,'margin-right:14px;width:36px; height:36px; position:relative; bottom:0; background:url(',$.imageicon,') no-repeat -327px 0px; border-radius:18px;"></div>',
								'</td>',
							'</tr>',
							'<tr style="',$.STYLE_NBODY,'">',
								'<td style="',$.STYLE_BODY,'overflow:visible;text-align:right;position:relative;">',
								  '<span class="view-chat-hidden-area" style="',$.STYLE_NBODY,'width:1px;height:16px;overflow:visible;position:relative;top:0px;">',
										'<div class="view-history-status" style="',$.STYLE_BODY,'display:none;color:#010002;line-height:16px;width:280px;position:absolute;left:-280px;top:-13px;">',
											'<div class="view-history-status-link" style="',$.STYLE_BODY,'float:right;line-height:16px;height:16px;"></div>',
											'<div class="view-history-status-icon" style="',$.STYLE_NBODY,'margin:2px 3px;float:right;display:block;line-height:16px;width:10px;height:10px;background:#fff url(',$.imageicon,') no-repeat -140px -39px;"></div>',
										'</div>',
									'</span>',
								//2017.05.16 隐藏访客名称
									// '<span class="view-history-nowDestname" style="',$.STYLE_BODY,'color:#999999;line-height:26px;font-family: MicrosoftYaHei;font-size:10px;">',
                                     //('\u672a\u767b\u5f55\u9f50\u5bb6\u7f51\u53cb' ||this.mode.user.name ),
                                    // ( $.global.uname || 'O\u7C89\u513F' ),
                                    // '</span>',
								  //2016.03.11更改颜色
									'<span class="view-history-time" style="',$.STYLE_BODY,'padding-left:6px;width:50px;color:#bbb;line-height:16px;font-size:12px;font-family:MicrosoftYaHei;">',$.formatDate(data.timerkeyid),'</span>',

								'</td>',
								'<td style="',$.STYLE_NBODY,'"></td>',
								'<td style="',$.STYLE_NBODY,'"></td>',//null
							'</tr>',
						'</tbody>',
					'</table>',
					'<br style="',$.STYLE_NBODY,'clear:both;" />'
				].join('') :
				/left|bottom/gi.test(type) ?
				[//接收的消息
					'<table style="',$.STYLE_NBODY,'float:left;float:none;table-layout:auto;border-collapse:separate;" class="view-history-left" cellpadding="0" cellspacing="0" border="0" class="table">',
						'<tbody style="',$.STYLE_NBODY,'">',
							'<tr style="',$.STYLE_NBODY,'">',
							    '<td style="',$.STYLE_NBODY,'width:48px;height:36px;vertical-align:bottom;vertical-align:top;overflow:visible;">',
                                       //2016.03.22增加头像 背景图片更改 29更改图片大小
									'<div class="view-history-div" style="',$.STYLE_NBODY,'float:left;margin-left:8px; -margin-left:7px; width:36px; height:36px; display:inline-block; position:relative; top:0; border-radius:50%">',
                                     (data.logo ? ['<img data-single="1" onerror="nTalk.loadImageAbnormal(this, event)" class="view-history-receive-icon" userid="', data.userid, '" src="', data.logo, '" style="', $.STYLE_NBODY, 'width:36px; height:36px;border-radius:18px;" />'].join('') :''),
                                   '</div>',
							    '</td>',
							   '<td style="',$.STYLE_NBODY,'width:10px;height:36px;vertical-align:bottom;vertical-align:top;overflow:visible;">',
									//2016.03.18更改垂直方向的位置
									//尖角添加className
									'<div class="view-history-angle" style="',$.STYLE_NBODY,'flaot:right;position:relative;top:0px;z-index:1;display:inline-block;width:10px;height:18px;background:url(',$.imageicon,') no-repeat -30px -62px;"></div>',
								'</td>',
								'<td class="view-history-content" style="',$.STYLE_BODY,'padding:8px 8px 8px 8px;background:#ffffff;border:1px solid #ffffff;border-radius:2px;-moz-border-radius:2px;-webkit-border-radius:2px">',
									'<div class="view-history-body" style="min-height:16px;',$.STYLE_BODY,(/^(2|4)$/i.test(data.type)&&!data.emotion ? 'text-align:center;display:table-cell;*display:inline-block;vertical-align:middle;/*width:100px;*/min-height:50px;height:85px;*font-size:0px;*line-height:0px;*font-family:MicrosoftYaHei;' : 'display:block;/*width:100%;*/'),'word-break:break-all;word-wrap:break-word;',(type=='bottom' ? 'width:60px;' : ''),
									(data.type == 1 ? 'color:#' + data.color + ';color:#666666;font:'+(data.italic=="true" ? 'italic' : 'normal')+' '+(data.bold=="true" ? 'bold' : 'normal')+' ' + data.fontsize + 'px/133%' + ' ' + 'MicrosoftYaHei,SimSun;color:#666666;text-decoration:' + (data.underline=="true" ? 'underline' : 'none') + ';' : ''),
									'">',
									(/^(1|9)$/i.test(data.type) ? data.msg : ''),
									'</div>',
								'</td>',
							'</tr>',
							'<tr style="',$.STYLE_NBODY,'">',
								'<td style="',$.STYLE_NBODY,'"></td>',
								'<td style="',$.STYLE_NBODY,'"></td>',
								'<td style="',$.STYLE_BODY,'overflow:visible;position:relative;">',
									'<span class="view-history-more" style="',$.STYLE_BODY,'margin-right:5px;float:left;color:blue;cursor:pointer;line-height:16px;display:none;">',$.lang.button_more,'</span>',
									'<span class="view-history-nowDestname" style="',$.STYLE_BODY,'float:left;color:#bbbbbb;line-height:16px;font-size:10px;">',
                                   (data.name || this.mode.dest.name),
                                    '</span>',
									//接收到非当前客服的消息时，显示客服名
									(data.userid && !this.mode.isVisitor(data.userid)&&this.mode.dest.id!=data.userid ?
										['<span class="view-history-destname" style="',$.STYLE_BODY,'padding-right:5px;float:left;color:#bbbbbb;line-height:16px;">',
											data.name,
										'</span>'].join('') :
									''),

									//2016.03.11更改颜色
									'<span class="view-history-time" style="',$.STYLE_BODY,'padding-left:6px;float:left;color:#bbbbbb;line-height:16px;font-size:12px;">',
										//客服输入状态消息不显示时间
										(type=='bottom' ? '' : $.formatDate(data.timestamp || data.timerkeyid)),
									'</span>',
									'<span class="view-chat-hidden-area" style="',$.STYLE_NBODY,'float:left;width:1px;height:26px;overflow:visible;position:absolute;">',
										'<div class="view-history-status" style="',$.STYLE_BODY,'display:none;color:#010002;line-height:26px;height:26px;width:280px;position:absolute;left:0px;top:0px;">',
											'<div class="view-history-status-icon" style="',$.STYLE_NBODY,'margin:7px 3px;float:left;line-height:26px;display:block;width:10px;height:10px;background:url(',$.imageicon,') no-repeat -140px -39px;"></div>',
											'<div class="view-history-status-link" style="',$.STYLE_BODY,'float:left;line-height:26px;height:26px;">',
											( /^(2|4)$/i.test(data.type)&&!data.emotion ?
												['<a href="javascript:void(0);" style="',$.STYLE_BODY,'">',$.lang.news_download,'</a>'].join('') :
												[''].join('')
											),
											'</div>',
										'</div>',
									'</span>',
								'</td>',
							'</tr>',
						'</tbody>',
					'</table>',
					'<br style="',$.STYLE_NBODY,'clear:both;" />'
				].join('') :
				type === 'first' ?
				[//系统消息:公众形像
					'<div class="view-history-system" style="',$.STYLE_BODY,'background:transparent;line-height:180%;marign:0 auto;padding:20px 0;text-align:center;word-break:break-all;word-wrap:break-word;">',
						data.msg,
					'</div>',
					'<br style="',$.STYLE_NBODY,'clear:both;" />'
				].join('') :
				type === 'goods' ?
				[//商品信息
					'<table style="',$.STYLE_NBODY,'float:left;width:100%;table-layout:auto;border-collapse:separate;" class="view-history-goods" cellpadding="0" cellspacing="0" border="0" class="table">',
						'<tbody style="',$.STYLE_NBODY,'text-align:center;">',
						'<tr style="',$.STYLE_NBODY,'">',
						'<td class="view-history-goods-image" style="',$.STYLE_BODY,'width:50%;min-width:150px;text-align:center;"></td>',
						'<td class="view-history-goods-info" style="',$.STYLE_BODY,'width:50%;text-align:left;"></td>',
						'</tr>',
						//background:#FFF url(',$.imageicon,') no-repeat 85px -80px;
						'<tr style="',$.STYLE_NBODY,'"><td colspan="2" style="',$.STYLE_NBODY,'height:10px;width:100%;"><div style="',$.STYLE_BODY,'margin:0 auto;height:10px;width:391px;"></div></td></tr>',
						'</tbody>',
					'</table>',
					'<br style="',$.STYLE_NBODY,'clear:both;" />'
				].join('') :
				[//系统消息2
					'<div class="view-history-system" style="',$.STYLE_BODY,'marign:20px 0;text-align:center;color:#706E6F;">',
						'<fieldset style="',$.STYLE_BODY,'margin:0 0 10px 0;text-align:center;border-top:1px solid #ccc;">',
							'<legend style="',$.STYLE_BODY,'margin:0 auto;text-align:center;word-break: normal;word-wrap:break-word;font:normal normal normal 12px/160% Arial,SimSun;color:#706e6f;width:',systemMsgLength,';overflow-x:hidden;display:block;" align="center">',
							'<div style="',$.STYLE_BODY,'text-align:center;word-break: normal;word-wrap:break-word;color:#706e6f;width:',systemMsgLength,';overflow-x:hidden;">',data.msg, '</div>',
							'</legend>',
						'</fieldset>',
					'</div>',
					'<br style="',$.STYLE_NBODY,'clear:both;" />'
				].join('');
		},
		/**
		 * @method _getViewHtml  聊窗HTML
		 * @param  {string} type 聊窗视图类型
		 * @return {string}      聊窗视图HTML
		 */
		_getViewHtml: function(type){
			var CON_STYLE_SHADOW = $.browser.msie&&$.browser.ieversion<=8 ? '' : 'box-shadow:inset 0px 0px 5px #aaa;-moz-box-shadow:inset 0px 0px 5px #aaa;-webkit-box-shadow:inset 0px 0px 5px #aaa;';

			return type=='load' ?
				[
					'<div class="chat-view-load-icon" style="',$.STYLE_NBODY,'margin:0 auto;width:100px;height:33px;background:transparent url(',$.loadingGif,') no-repeat 0px 0px;"></div>',
					'<div class="chat-view-load-info" style="',$.STYLE_BODY,'text-align:center;">',$.lang.chat_info_loading,'</div>',
					'<div class="chat-view-load-error" style="',$.STYLE_BODY,'text-align:center;margin:120px auto 0;display:none;">',$.lang.chat_info_failure,'<!--<span style="',$.STYLE_BODY,'cursor:pointer;color:#005ffb;text-decoration:none;">',$.lang.chat_info_reload,'</span>--></div>'
				].join('') :
				type=='window' ?
				[
					//显示聊天记录
					'<div class="chat-view-float-history" style="',$.STYLE_BODY,'width:100%;height:270px;height:267px\\0;_height:269px;background:#fff;padding-top:1px solid #fff\\0;position:absolute;overflow:hidden;z-index:99;display:none;box-shadow:0 5px 3px #888888;">',
						'<iframe class="chat-view-float-iframe" scrolling="no" frameborder="0" style="',$.STYLE_BODY,'display:block;width:100%;height:100%;">',
						'</iframe>',
					'</div>',
					'<div class="chat-view-window-history" style="',$.STYLE_BODY,'width:100%;height:270px;height:267px\\0;_height:269px;background-repeat:no-repeat;background-position:center bottom; padding-top:1px solid #fff\\0;position:relative;overflow-x:hidden;overflow-y:scroll;">',
						'<ul style="',$.STYLE_NBODY,'list-style:none;margin:10px 0px 10px 0px;">',
							//'<li style="',$.STYLE_NBODY,'list-style:none;"></li>',
						'</ul>',
					'</div>',
					//2016.03.11更改border 的颜色
					'<div class="chat-view-window-toolbar" style="',$.STYLE_BODY,'height:28px;width:100%;border-top:1px solid #ffffff;background:#ffffff;">',
						//分配客服时状态消息
						//2017-05-16 xiu
						'<div class="chat-view-hidden-area" style="',$.STYLE_NBODY,'width:0px;height:0px;position:relative;overflow:visible;">',
							'<div class="chat-view-window-status-info" style="',$.STYLE_BODY,'background:#01B8EF;overflow:hidden;color:#fff;margin-left:10px;width:380px;line-height:25px;height:25px;position:absolute;top:-30px;z-index:99;text-align:center;display:none;"></div>',
						'</div>',
						//2015.01.05 添加输入提示建议 3.21更改margin 值
						'<div class="chat-view-hidden-area" style="',$.STYLE_NBODY,'width:0px;height:0px;position:relative;overflow:visible;">',
							'<div class="chat-view-suggest-list chat-view-span" style="',$.STYLE_NBODY,'border:1px solid #999;background:#fafafa;width:440px;line-height:30px;height:auto;position:absolute;top:-88px;left:0px;z-index:999;display:none;">',
								'<ul style="',$.STYLE_BODY,'list-style:none;"></ul>',
							'</div>',
						'</div>',
						//2016.03.15修改padding margin 高度
						'<div class="chat-view-button chat-view-face" title=',$.lang.button_face,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:7px 0px 0px 12px;_margin-left:5px;border:0px solid #ccc;height:15px;display:inline-block;cursor:pointer;width:15px;background:url(',$.themesURI+'face.png',') no-repeat center center;">',
							'<div class="chat-view-hidden-area" style="',$.STYLE_NBODY,'width:0px;height:0px;position:relative;overflow:visible;">',
								'<div class="chat-view-span chat-view-window-face" style="',$.STYLE_NBODY,'display:none;position:absolute;left:-11px;top:-229px;border:1px solid #979A9E;width:273px;height:224px;background:#fff;z-index:1000002;cursor:auto;border-radius:3px;overflow:hidden;">',

								'</div>',
							'</div>',
						'</div>',
						//2016 更改图标padding 值
						'<div class="chat-view-button chat-view-image" title=',$.lang.button_image,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:7px 0px 0px 12px;border:0px solid #ccc;height:15px;display:inline-block;cursor:pointer;width:15px;background:url(',$.themesURI+'img.png',') no-repeat center center;"></div>',
						'<div class="chat-view-button chat-view-file" title=',$.lang.button_file,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:7px 0px 0px 12px;border:0px solid #ccc;height:15px;display:inline-block;cursor:pointer;width:15px;background:url(',$.themesURI+'file.png',') no-repeat center center;"></div>',
						//2016.03.21更改位置
						'<div class="chat-view-button chat-view-capture" title=',$.lang.button_captureImage,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:7px 0px 0px 12px;border:0px solid #ccc;height:15px;display:inline-block;cursor:pointer;width:15px;background:url(',$.themesURI+'capture.png',') no-repeat center center;"></div>',
						/*'<div class="chat-view-capture-options" style="',$.STYLE_BODY,'color:#525252;float:left;margin:8px 0 4px 0px;border:0px solid #ccc;height:16px;display:inline-block;cursor:pointer;">',
							'▼',
							'<div class="chat-view-capture-hidden-area" style="',$.STYLE_NBODY,'width:1px;height:1px;position:relative;overflow:visible;">',
								'<div class="chat-view-span chat-view-options-capture-menu" style="',$.STYLE_BODY,'display:none;padding:1px;background:#fff;position:absolute;left:-89px;top:-79px;border:1px solid #ccc;width:100px;*width:102px;_width:102px;height:auto;z-index:1000002;cursor:cursor;">',
									//截图方式
									'<div class="view-option-hidden talk_selected" style="',$.STYLE_BODY,'padding:3px 0 3px 10px;background:#efefef;">',$.lang.button_capture_hidden_chatWin,'</div>',/*',隐藏窗口,'*/
									/*'<div class="view-option-show" style="',$.STYLE_BODY,'padding:3px 0 3px 10px;">',$.lang.button_capture_show_chatWin,'</div>',/*',不隐藏窗口,'*/
								/*'</div>',
							'</div>',
						'</div>',*/
						'<div class="chat-view-button chat-view-evaluate" title=',$.lang.button_evaluation,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:7px 0px 0px 12px;border:0px solid #ccc;height:15px;display:inline-block;cursor:pointer;width:15px;background:url(',$.themesURI+'evaluate_Copy.png',') no-repeat center center;"></div>',
						'<div class="chat-view-button chat-view-history" title=',$.lang.button_save,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 6px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -200px 2px;padding:2px;"></div>',
						//2014.11.11 添加查看聊天记录按钮
						'<div class="chat-view-button chat-view-load-history" title=',$.lang.button_view,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 6px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -220px -40px;padding:2px;"></div>',


						//2015.01.06 机器要转人工客服按钮
						'<div class="chat-view-switch-manual chat-view-robot-button" title="',$.lang.button_switch_manual,'" style="',$.STYLE_BODY,'color:#525252;float:left;padding:0 0 0 20px;margin:4px 0 4px 6px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:auto;background:url(',$.imageicon,') no-repeat -265px -40px;display:none;">',$.lang.button_switch_manual,'</div>',
						'<div class="chat-view-button chat-view-change-csr" title=',$.lang.button_change_csr,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 6px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -243px -40px;"></div>',
						//2017.05.15 隐藏更多按钮
						'<div class="chat-view-button chat-view-exp" style="',$.STYLE_BODY,'color:#525252;float:right;margin:4px 3px;padding:0 3px;border:0px solid #999999;height:20px;display:inline-block;cursor:pointer;font-family:MicrosoftYaHei;">\u66F4\u591A&gt;</div>',
					'</div>',
					//2016.03.11 更改高度和padding值
					'<div class="chat-view-window-editor" style="',$.STYLE_BODY,'height:65px;width:100%;overflow:hidden;">',
						//2016.03.22更改固定文字 更改颜色
						'<textarea placeholder="\u6211\u6709\u95ee\u9898\uff0c\u6211\u8981\u95ee\u002e\u002e\u002e" style="',$.STYLE_BODY,CON_STYLE_SHADOW,'margin:1px;padding:0px 10px 0px 10px;width:391px;width:411px\\9;height:73px;height:93px\\9;outline:0px solid #08f;border:0px solid #08f;color:#bbbbbb;font-family:MicrosoftYaHei;resize:none;overflow:hidden;"></textarea>',
					'</div>',
					'<div class="chat-view-window-bottom" style="',$.STYLE_BODY,'height:40px;width:100%;background:#fafafa;border-radius:0px 0px 0px 5px;-moz-border-radius:0px 0px 0px 5px;-webkit-border-radius:0px 0px 0px 5px">',
						'<div class="chat-view-submit-par" style="',$.STYLE_BODY,'position:relative;margin:6px 0;float:right;width:80px;height:26px;line-height:26px;text-align:center;cursor:pointer;background:#01B8EF;margin-right:10px;border-radius:3px;-moz-border-radius:3px;-webkit-border-radius:3px;">',
							'<div class="chat-view-options" style="',$.STYLE_BODY,'float:right;width:26px;height:26px;line-height:26px;text-align:center;cursor:pointer;background:transparent;color:#fff;">',
								'<span style="display:inline-block;width:8px;height:26px;background:url('+$.themesURI+'send.png) no-repeat 1px 12px; "></span>',
								'<div class="chat-view-hidden-area" style="',$.STYLE_NBODY,'width:1px;height:1px;position:absolute;top:2px;left:0px;overflow:visible;">',
									'<div class="chat-view-span chat-view-options-menu" style="',$.STYLE_BODY,'display:none;padding:1px;background:#fff;position:absolute;left:0px;top:-50px;border: 1px solid #01B8EF;width:80px;*width:80px;_width:80px;height:auto;z-index:1000002;cursor:cursor;">',
										//发送消息方式
										'<div class="view-option-ctrl+enter talk_selected" style="',$.STYLE_BODY,'padding:3px 0 3px 5px;background:#efefef;font-family: MicrosoftYaHei;font-size:10px;">','\u6309',$.lang.button_ctrl_enter,'</div>',
										'<div class="view-option-enter" style="',$.STYLE_BODY,'padding:3px 0 3px 5px;font-family: MicrosoftYaHei;font-size:10px;">','\u6309',$.lang.button_enter,'</div>',
									'</div>',
								'</div>',
							'</div>',
						  '<div class="chat-view-submit" style="',$.STYLE_BODY,'float:left;color:#fff;width:54;height:26px;line-height:26px;text-align:center;cursor:pointer;background:transparent;font-family: MicrosoftYaHei;">',$.lang.chat_button_send,'</div>',
            			'</div>',
            			'<span class="chat-view-end-session" style="',$.STYLE_BODY,'text-decoration:none;float:right;height:26px;line-height:26px;font-size:12px;font-family: MicrosoftYaHei;color:#666666;cursor:pointer;font-family: MicrosoftYaHei;">',$.lang.chat_button_close,'</span>',
						'<div style="',$.STYLE_NBODY,'clear:both;"></div>',
					'</div>'
				].join('') :
				type=='message' ? [
					'<div class="chat-view-message-announcement" style="',$.STYLE_BODY,'margin:10px 20px 10px 20px;height:auto;max-height:200px;overflow:hidden;display:none;"></div>',
					'<div class="chat-view-message-body" style="',$.STYLE_BODY,'overflow-x:hidden;overflow-y:auto;width:100%;">',
					'<form name="chat-view-message-form" action="" enctype="multipart/form-data" target="chat-view-submit-iframe" method="post" class="chat-view-message-form" style="',$.STYLE_NBODY,'display:block;">',
						'<input type="hidden" value="' + $.charset + '" name="charset" />',
						'<input type="hidden" value="' + $.source + '" name="parentpageurl" />',
						'<input type="hidden" value="" name="myuid" />',
						'<input type="hidden" value="" name="destuid" />',
						'<input type="hidden" value="" name="ntkf_t2d_sid" />',
						'<input type="hidden" value="" name="source" />',
						'<input type="hidden" value="' + this.settingid + '" name="settingid" />',
						'<div class="chat-view-message-table" style="',$.STYLE_BODY,'width:100%;"></div>',
					'</form>',
					'</div>'
				].join('') :
				[
					//Alter
					'<iframe class="ntkf-alert-iframe" style="',$.STYLE_BODY,'display:none;position:absolute;left:0;top:0;width:100%;height:464px;-moz-opacity:0;opacity:0;filter:alpha(opacity=0);z-index:88888;">',
					'</iframe>',
					'<div class="ntkf-alert-background" style="',$.STYLE_BODY,'display:none;position:absolute;left:0;top:0;width:100%;height:464px;background:#000;-moz-opacity:0.35;opacity:0.35;filter:alpha(opacity=35);z-index:99999;">',
					'</div>',
					'<div class="ntkf-alert-container" style="',$.STYLE_BODY,'display:none;position:absolute;left:2px;top:0;width:100%;min-height:260px;height:auto;-moz-opacity:1;opacity:1;filter:alpha(opacity=100);border:3px solid #00acff;z-index:2000000000;background:#fff;">',
					'</div>'
				].join('');
		},
		/**
		 * @method _bind    绑定事件
		 * @return {void}
		 */
		_bind: function(){
			var self = this;

			this.textEditor = this.chatElement.find('.chat-view-window-editor textarea').css({
				width: $.browser.Quirks ? '411px' : '391px',
				height:$.browser.Quirks ? '93px' : '73px'
			}).bind('keypress', function(event){
				event = $.Event.fixEvent(event);
				event.stopPropagation();

				if( event.keyCode == 13 && event.shitfKey ){
					//Enter
				}else if( self._sendKey == 'Enter' ){
					if( (event.keyCode == 13 && event.ctrlKey) || event.keyCode == 10 ){
						//--IE下\r\n后无字符时，用户只看到一个空格，未换行
						self.textEditor.val( self.textEditor.val() + "\r\n" );
					}
					else if( event.keyCode == 13 ){
						event.preventDefault();
						self._send();
					}
				}else if( self._sendKey == 'Ctrl+Enter' ){
					if( /^(10|13)$/.test(event.keyCode) && event.ctrlKey ){
						event.preventDefault();
						self._send();
					}
				}

				self._editorStart = self._getPositionForTextArea(this) + 1;
				//$.Log('set editorStart:' + self._editorStart, 1);
			}).bind('keyup', function(event){
				event = $.Event.fixEvent(event);
				//按键时，清除超出最大输入值内容
				var keyCode  = event.keyCode,
					enLength = $.enLength($(this).val()),
					selectIndex = 0
				;
				if( enLength > self.mode.inputMaxByte ){
					$(this).val( $.enCut($(this).val(), self.mode.inputMaxByte) );
				}
				//2015.07.02 按上下方向键时，机器人输入提示选中项可上下移动
				if( keyCode == 38 ){
					event.preventDefault();
					self._selectSuggest(-1);
				}else if( keyCode == 40 ){
					event.preventDefault();
					self._selectSuggest(1);
				}
			}).bind('click', function(){
				self._editorStart = self._getPositionForTextArea(this);

				//$.Log('set editorStart:' + self._editorStart, 1);
			}).bind('focus', function(){
				$.promptwindow.stopPrompt();
				self.chatElement.find('.chat-view-hidden-area .chat-view-span').display();

				var css = {color:'#333333'};
				if( $.browser.msie && $.browser.ieversion<=7 ){
					//2016.03.11消除点击时的边框border为0
					$(this).css($.merge(css, {
						'width':	($(this).parent().width() - 26) + 'px',
						'height':	($(this).parent().height() - 26) + 'px',
						'border-width': '0px'
					}));
				}else{
					//2016.03.11消除点击时的边框border为0
					$(this).css($.merge(css, {"outline-width": "0px"}));
				}
				if( !$.browser.html5 ){
					//模拟提未文件会在拖动文本、图片进入textarea区后，提示文本未清除
					if( $(this).val() == $.lang.default_textarea_text ){
						$(this).val('');
					}
				}

				//2015.09.10 获取焦点时，开始监听
				self._listenTextEditor();
			}).bind('blur', function(){
				if( !$.browser.html5 ){
					if( $(this).val() === '' ){
						$(this).val($.lang.default_textarea_text);
					}
					if( $(this).val() == $.lang.default_textarea_text ){
						$(this).css({'color': '#ccc'});
					}
				}
				if( $.browser.msie && $.browser.ieversion<=7 ){
					$(this).css({
						"border-width": '0px',
						'width':	($(this).parent().width() - 24) + 'px',
						'height':	($(this).parent().height() - 24) + 'px'
					});
				}else{
					$(this).css({"outline-width": "0"});
				}

				self._stopListen();
			}).bind('paste', function(e){
				var pasteCallback = function(base64) {
					if(!base64) return;

					$.pasteBase64 = base64;
					var c_top = ($(window).height()-510) / 2;
					var t_top = c_top + 480;
					var left = ($(window).width()-640) / 2;
					var ensurePicHtml = [
						'<div class="pastepic-background" style="width:100%;height:100%;position:absolute;top:0px;left:0px;background-color:#000;opacity:0.6;z-index:5000000;display:none;color:#FFF;"></div>',
						'<div class="pastepic-container" style="top:',c_top,'px;left:',left,'px;width:640px;height:480px;background-color:#fff;text-align:center;z-index:5000000;margin:auto;position:absolute;display:none;">',
					    	'<img class="pastepic-show" style="max-width:640px;max-height:480px;" src=""></img>',
					    '</div>',
					    '<div class="pastepic-toolbar" style="top:',t_top,'px;left:',left,'px;width:640px;height:30px;position:absolute;z-index:5000000;margin:auto;text-align:right;background-color:transparent;display:none;">',
					    	'<div class="pastepic-toolbar-main" style="width:320px;height:30px;line-height:30px;position:relative;float:right;background-color:#F9F9F9;">',
					    		'<span class="pastepic-describe" style="font-size:12px;font-weight:bold;color:#333333;float:left;margin-left:10px;">是否粘贴此图片</span>',
								'<span class="pastepic-choose-no" style="font-size:12px;color:#333333;cursor:pointer;width:45px;display:inline-block;margin-right:25px;background:url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAANeSURBVDhPXVW/axVBEJ7du7zCMqW1hXX0L0gjRIMWplALRbAIMYnxByiibXgIYhA0gqJgp4JirIMaGxUVbcXOTpuYvNzt3e2O3zf33otxHsfe7c58+83Mt/tcCEEF5iWTqJWNSdTGxifJk5eE0cFLnWDku7d3enksKD8Q1eL0LUk0EDMPB6+SpSiOSIkB3kAbcZiDX1JxPkoCjnexjYMNAW0TD5aIQigCMlF8KzZyFpCA4STHDEfJMB8zW6sHRGBDQEspJgOLf35jA3BBegQdpJhlDTwRorX4ouqninn4DWwIyFfFrs3chNQHdku8eQ4p5+AXAYZaMQaMUtiS+vyEbI2PSrp/zTYimYH9A4hib22KfnoNjl6aZ3el6k4jM3qDKcmUW9IsHJb4YRU+KtWbFyw1SrwNsyPluGtU9Pi8fROmXnkgaXEOqeErbEh5cVLc5zU0A/4oReckGALC/5PyUDaORacnOlovXRJ5ugQgznvJJ09J/PlDGoBlZApanSvLIgdP2WYuY5zBbAMyLS8j5qAuSXProjRPbpuC6Gvlx4ZUUOfysuSHToBdbpFt0/7TIV8bqUzE7HQ235VsakbUNMiKoQxIrXPljvjJkwZGEOp0AOYc8xkaUsPPaonHl0Hc96/cHt3GMnBH2PVv763bFsFThAUTOozZDQG5SwXt8Si5cl3ChcOiX94Zs4SaOTBtPHT46qHU3TMWAzwzhS7JjjYEpM46mkvT25Tq0lEweYtF/PyIZFeXxR2bRVB79NLKQ4mLMxbDhzpNPIM0NoVPGWqtQ6Wb0+O6vs/pxn7RP/u9Fs/vaSgaLctSe91Z3RwTrGNtzGlxc0GrUGhVthhVVaE9fUNCOHK/RD+u4rih0DjL+dV74iZOg0abUs5GHT9r3qxtubaCEYyBYuqgzgYMAxiWVaG9Gwu6fmSPliuPbT6CdVkFLUJpGfQwFnev68bUXg0vH9laKMo+RtBtYVNLihuEZwm78uCTFWvWQX0iSHEOXubTgJY1EO48EDwYtGHKwtsF3Y+KK8sObntdEd+6jNF0h3dcSrzpWhJ0BRHaTtnAwzSFAO4s0CSlzofzrFPW7yaZMzhBRnQd4ZGF7RQ2dEanPCKoz9D2AwtKw+5GziMNB3lt/xVwy5ahc07+ArnLFQPLE82pAAAAAElFTkSuQmCC\') no-repeat 5px 5px">否</span>',
					    		'<span class="pastepic-choose-yes" style="font-size:12px;color:#333333;cursor:pointer;width:50px;display:inline-block;margin-right:25px;border:1px solid #cfcfcf;height:20px;line-height:20px;padding:0 8px 0 1px;border-radius:3px;background:url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAIAAAAC64paAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKPSURBVDhP1VLNS1VREJ85531oGomaCMFDREmIIgg3FW0qamGLFyUFtXFlRBgIkS500cciigjSvyCiTRS2blHQ8oGtkvSpkGj4kSX4vF9npt+5T7G1u+bCveeemfnNzG9+HIYh7dXM9ndP9v8mi7I/qaqh9LSL6F1KmerPWrJ0/9v5YqlpfOEeYpQMR0Eo5NPUqjpi9vlWRXyaIXW4wWElnB+ZubIYzAu85F4dna7PNRthA6+QoyTtIoV0bMSDMcCc2oXw+9DUxZ/BDyaXVenc112Xb0Zxj02UCXXrw/LYp/X3pDFK+17gMqqUKweTQ1M9q26NNQZWR/2J0cNvEYYGOYyDROhJ+Xpp/WPC7kxj8U7bWC3VOJS10dRG6cHctc1oA80L8fH9p4Y7X+e5DmUTcoYdZ5VXojVHzrL5/Ovd05m+QLdQ9uvvL6Plq5vxHz+22u6GC8Mdb/JcS5rBZHlljuIKsqYrpZHZYiWspBX02IGT5xpvvpwdSDh2xlnh0w3Fu+3jlms0ZR7DGlZoO8Y/WCpvTY7M9FaiZQEPaUjKPGLkbPONW4Vn1mZZHNhIebTgGD5EJeC8vfbI466JpuyhNMsC3HNPdOlg/+2255ZzhEzcbovC+QUKHr8f0GELua6HXRMt+YJJ41C1t3Wwr/CIU/qhFtTw9zvmRUIsaizqQFCWdNUtvZjrXwzmLrcO9LT0QThgiCnx3UJNANoxrkShrU7o+/eNgli/ZIBVW8QXesGLwbF1ZjfZIBN6AiR48kU4D1EJxSKJVxp2xPCwVZw0AU3/GGSIPSMATugNRMesOdaMABbXkrA11SaYs2nbu4b4OFYnFgyzOgyG+cFejI4yIsZkIO6UJxGJ4N3OgxH9Ben/Y4RnXjBoAAAAAElFTkSuQmCC\') no-repeat 5px 0px">是</span>',
					    	'</div>',
					    '</div>'
					].join("");

					if($('.pastepic-background').length == 0){
						$(document.body).append(ensurePicHtml);
						$('.pastepic-choose-no').bind('click', function() {
			            	background.display(0);
			            	container.display(0);
			            	toolbar.display(0);
						});
						$('.pastepic-choose-yes').bind('click', function() {
			            	background.display(0);
			            	container.display(0);
			            	toolbar.display(0);
			            	self.objImage.base64Transf($.pasteBase64);
						});
					}

		            var background = $('.pastepic-background');
		            var container = $('.pastepic-container');
		            var toolbar = $('.pastepic-toolbar');
		            var img = $('.pastepic-show');

					img.attr('src', base64);

		            background.display(1);
		            container.display(1);
		            toolbar.display(1);
				}

				var paste = new $.paste(e, pasteCallback);
				paste.getImgBase64Str();

			});

			if( this.textEditor.val() == '' && !$.browser.html5 ){
				this.textEditor.val( $.lang.default_textarea_text );
			}

			//this._listenTextEditor();
			//结束会话
			this.chatElement.find('.chat-view-end-session').click(function(event){
				$.Event.fixEvent(event).stopPropagation();

				self._endSession();
			});

			var positionX, positionY;
			//bind chat tools button event
			this.chatElement.find('.chat-view-button,.chat-view-switch-manual').hover(function(event){
				$.Event.fixEvent(event).stopPropagation();
				if( $(this).attr('talk_disable') || $(this).attr('selected') ){
					return;
				}
				//2016.03.15
				//$(this).css('background-color','#feb4b3');

				//hack lt IE8 2016.03.15注释
				//positionX = $(this).css('background-position').split(' ').shift();
				//positionY = $(this).indexOfClass('chat-view-load-history')||$(this).indexOfClass('chat-view-switch-manual')||$(this).indexOfClass('chat-view-change-csr') ? ' -59px' : ' -17px';

				//$(this).css('background-position', positionX + positionY);
			}, function(event){
				$.Event.fixEvent(event).stopPropagation();
				if( $(this).attr('talk_disable') || $(this).attr('selected') ){
					return;
				}
				$(this).css('background-color','');
				//hack lt IE8 2016.03.15注释
				/*positionX = $(this).css('background-position').split(' ').shift();
				if( $(this).indexOfClass('chat-view-face') ) {
					positionY = ' 2px';
				}else if( $(this).indexOfClass('chat-view-load-history') || $(this).indexOfClass('chat-view-switch-manual') || $(this).indexOfClass('chat-view-change-csr')) {
					//2016.03.15修改值
					positionY = ' -39px';
				}else {
					////2016.03.15修改值
					positionY = ' 2px';
				}

				$(this).css('background-position', positionX + positionY);*/
				//2016.03.15

              });
            //2016.03.18修改更多上面的按钮出现红色
            this.chatElement.find('.chat-view-exp').hover(function(event){
				$.Event.fixEvent(event).stopPropagation();
				if( $(this).attr('talk_disable') || $(this).attr('selected') ){
					return;
				}
				//2016.03.15
				$(this).css('background-color','#ffffff');

			}, function(event){
				$.Event.fixEvent(event).stopPropagation();
				if( $(this).attr('talk_disable') || $(this).attr('selected') ){
					return;
				}
				$(this).css('background-color','');
			});

			this.chatElement.find('.chat-view-face').click(function(event){
				//表情统计点
				self.mode.callTrack("10-02-02");

				$.Event.fixEvent(event).stopPropagation();

				self.chatElement.find('.chat-view-window-face').display(1);
				self._initFaceGroup();
			});

			this.chatElement.find('.chat-view-image').click(function(event){
				//发送图片统计点
				self.mode.callTrack("10-02-03");
				//2016.03.30修改
				self.chatElement.find('.chat-view-window-face').display();

				$.Event.fixEvent(event).stopPropagation();

				self._image(event);
			});

			this.chatElement.find('.chat-view-file').click(function(event){
				//发送文件统计点
				self.mode.callTrack("10-02-05");

				$.Event.fixEvent(event).stopPropagation();
				//2016.03.30修改
				self.chatElement.find('.chat-view-window-face').display();

				self._file(event);
			});
			this.chatElement.find('.chat-view-history').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				//2016.03.30修改
				self.chatElement.find('.chat-view-window-face').display();
				if( $(this).attr('talk_disable') ) return;
				self._download(event);
			});
			// 2014.11.11 添加查看聊天记录按钮，此按钮有选中与未选择两种状态，选中时显示聊天记录框
			this.chatElement.find('.chat-view-load-history').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				//2016.03.30修改
				self.chatElement.find('.chat-view-window-face').display();
				if( $(this).attr('talk_disable') ) return;

				//显示隐藏聊天记录
				self._viewHistory( !$(this).attr('selected') );
			});
			this.chatElement.find('.chat-view-evaluate').click(function(event){
				//评价统计点
				self.mode.callTrack("10-02-09");

				$.Event.fixEvent(event).stopPropagation();
				//2016.03.30修改
				self.chatElement.find('.chat-view-window-face').display();

				if( $(this).attr('talk_disable') ) return;
				self._evaluate(event);
			});

			this.chatElement.find('.chat-view-capture').click(function(event){
				//截图统计点
				self.mode.callTrack("10-02-04");

				$.Event.fixEvent(event).stopPropagation();

				if( $(this).attr('talk_disable') ) return;
				self._capture(event);
			});
			this.chatElement.find('.chat-view-switch-manual').click(function(event){
				//转人工客服
				$.Event.fixEvent(event).stopPropagation();

				if( $(this).attr('talk_disable') ) return;
				self._switchManual(event);
			});
			this.chatElement.find('.chat-view-change-csr').click(function(event){
				//切换客服
				$.Event.fixEvent(event).stopPropagation();

				if( $(this).attr('talk_disable') ) return;
				self._changeCsr(event);
			});

			this.chatElement.find('.chat-view-exp').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				//2016.03.30修改
				self.chatElement.find('.chat-view-window-face').display();

				self._expansion(event);
			});
			//点击其它地址，隐藏表情
			this._eventFunction = function(event){
				self._hiddenFloatMenu();
			};
			$(document.body).click(this._eventFunction);

			//发送设置
			//,.chat-view-options,.chat-view-options-menu .chat-view-span div
			this.chatElement.find('.chat-view-submit').hover(function(event){
				$.Event.fixEvent(event).stopPropagation();
				$(this).css({
					//'background-color': '#F1F1F1'
				});
			}, function(event){
				$.Event.fixEvent(event).stopPropagation();
				$(this).css({
					//'background-color': 'none'
				});
			});

			this.chatElement.find('.chat-view-submit').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				if( $(this).attr('talk_disable') ) return;
				self._send(true);
			});
			this.chatElement.find('.chat-view-options').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				//show menu
				self.chatElement.find('.chat-view-hidden-area .chat-view-options-menu').display(1);
			});
			//截图按钮配置选项
			this.chatElement.find('.chat-view-capture-options').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				//show menu
				self.chatElement.find('.chat-view-capture-hidden-area .chat-view-options-capture-menu').display(1);//.show();
			});
			this.chatElement.find('.chat-view-options-menu div').click(function(event){
				$.Event.fixEvent(event).stopPropagation();

				self.chatElement.find('.chat-view-options-menu div').each(function(i, element){
					$(element).removeClass('talk_selected').css('background', 'none');
				});
				if( $(this).indexOfClass('view-option-enter') ){
					self._sendKey = 'Enter';
				}else{
					self._sendKey = 'Ctrl+Enter';
				}
				$(this).addClass('talk_selected').css('background', '#f1f1f1');
				$(this).parent().display();
			});

			this.chatElement.find('.chat-view-options-capture-menu div').click(function(event){
				$.Event.fixEvent(event).stopPropagation();

				self.chatElement.find('.chat-view-options-capture-menu div').each(function(i, element){
					$(element).removeClass('talk_selected').css('background', 'none');
				});
				if( $(this).indexOfClass('view-option-hidden') ){
					$.Capture.captureWithMin = true;
				}else{
					$.Capture.captureWithMin = false;
				}
				$(this).addClass('talk_selected').css('background', '#f1f1f1');
				$(this).parent().display();
			});

			//2014.11.17 聊天记录查看区关闭按钮
			this.options.chatHeader.find('.header-chatrecord-close').css({
				margin: '20px 5px 0 0',
				background: 'url(' + $.imageicon + ') no-repeat -60px 0'
			}).attr('title', $.lang.chat_button_close)
				.hover(function(event){
				$(this).css('background-position', '-60px -20px');
			}, function(event){
				$(this).css('background-position', '-60px 0');
			}).click(function(event){
				$.Event.fixEvent(event).stopPropagation();

				self._viewHistory(false);
			});
		},
		/**
		 * @method audioProgress 音频进度
		 * @param  {string} msgid
		 * @param  {number} progress
		 * @return {void}
		 */
		audioProgress: function(msgid, progress){
		},
		/**
		 * @method _hiddenFloatMenu 隐藏浮动层菜单
		 * @return {void}
		 */
		_hiddenFloatMenu: function(){
			this.chatElement.find('.chat-view-hidden-area .chat-view-span').display();
			this.chatElement.find('.chat-view-capture-hidden-area .chat-view-span').display();
		},
		/**
		 * 禁用或启用按钮功能
		 * @param  string|array   buttonName 按钮简写名
		 * @param  boolen         disable    禁用｜启用
		 * @return boolen
		 */
		disableButton: function(buttonName, disable){
			var self = this, selector = [];

			buttonName = $.isArray(buttonName) ? buttonName : [buttonName];
			$.each(buttonName, function(i, name){
				selector.push('.' + self.buttonSelectors[name] );
			});
			selector = selector.join(',');

			if( disable ){
				if( selector.indexOf('chat-view-image') > -1 ){
					this.chatElement.find('.chat-view-image').find('object,embed,form').css('visibility', 'hidden');
				}
				if( selector.indexOf('chat-view-file') > -1 ){
					this.chatElement.find('.chat-view-file').find('object,embed,form').css('visibility', 'hidden');
				}
				if( selector.indexOf('chat-view-change-csr') > -1){
					$('.chat-view-change-csr').css('background-position-y', ' -40px');
				}
				this.chatElement.find(selector).attr('talk_disable', 'disable').css('opacity', '0.4');
				return false;
			}else{
				if( selector.indexOf('chat-view-image') > -1 ){
					this.chatElement.find('.chat-view-image').find('object,embed,form').css('visibility', 'visible');
				}
				if( selector.indexOf('chat-view-file') > -1 ){
					this.chatElement.find('.chat-view-file').find('object,embed,form').css('visibility', 'visible');
				}
				this.chatElement.find(selector).attr('talk_disable', '').css('opacity', 1);
				return true;
			}
		},
		/**
		 * 显示功能按钮
		 * @param  string|array   buttonName 按钮简写名
		 * @param  boolen         display    显示｜隐藏
		 * @return boolen
		 */
		displayButton: function(buttonName, display){
			var self = this, selector = [];

			buttonName = $.isArray(buttonName) ? buttonName : [buttonName];

			$.each(buttonName, function(i, name){
				selector.push('.' + self.buttonSelectors[name] );
			});
			selector = selector.join(',');

			this.chatElement.find(selector).display(!display);
		},
		/**
		 * 禁用音频按钮
		 * @return {void}
		 */
		disabledAudioButton: function(){
		},
		/**
		 * 监听输入框内容，定时发送当前输入框消息内容（消息预知）
		 * @return {void}
		 * 2015.09.10 优化监听
		 *   获得焦点时，开始监听，失去焦点时，停止监听
		 *   监听频次改为1s，保存2s发送消息
		 */
		_listenTextEditor: function(){
			//消息预知
			var self = this;
			this._listenTimeID = setInterval(function(){
				var Listen = self.textEditor.val();
				var cacheListen = self._cacheListen;

				if( !$.browser.html5 && Listen == $.lang.default_textarea_text ){
					Listen = '';
				}
				//输入内容超出限制时
				if( $.enLength(Listen) > 500 ){
					Listen = $.enCut(Listen, 500);
					self.textEditor.val( Listen );

					self.textEditor.scrollTop( self.textEditor.scrollHeight() );
				}

				self._listenNumber++;
				if( ((Listen && cacheListen !== Listen) ||
				(!Listen && cacheListen)) && self._listenNumber%2 == 0 ){
					self.mode.predictMessage(Listen);
				}
				self._cacheListen = Listen;
			}, 1E3);
		},
		/**
		 * @method _stopListen 停止监听消息输入框
		 * @return {void}
		 */
		_stopListen: function(){
			this._listenNumber = 0;
			clearInterval(this._listenTimeID);
			this._listenTimeID = null;
		},
		/**
		 * @method _initFaceGroup 初始化表情列表
		 * @return {void}
		 * 2015.08.27 事件优化
		 */
		_initFaceGroup: function(){
			var self	= this, cstyle,
				style	= $.STYLE_NBODY + 'outline:0;float:left;padding:8px;width:23px;height:23px;display:inline;zoom:1;'
			;
			if( this._initFace ){
				return;
			}
			this._initFace = true;

			if( !this.chatElement.find('.chat-view-face-tags').length ){
				this.chatElement.find('.chat-view-window-face').append(['<div class="chat-view-face-tags" style="',$.STYLE_NBODY,'background:#F1F1F1;clear:both;padding:0 10px;height:38px;border-top:1px solid #D4D4D4;"></div>'].join(''));
			}
			//init face group
			$.each(this.mode.config.faces, function(i, cFace){
				var groupClass	= 'chat-view-face-group-' + i;
				var tagClass	= 'chat-view-face-tag-' + i;
				//表情组
				if( !self.chatElement.find('.' + groupClass).length ){
					self.chatElement.find('.chat-view-window-face').insert('<div class="' + groupClass + ' chat-view-face-group" style="' + $.STYLE_NBODY + (i == 0 ? '' : 'display:none;') + 'overflow-x:hidden;overflow-y:auto;margin:10px 0px 10px 10px;clear:left;height:165px;"></div>', 'afterbegin');
				}
				$.each(cFace.pics, function(faceIndex, jsonFace){
					var j	= faceIndex + 1;
					var alt	= i == 0 ? ' title="' + jsonFace.sourceurl + '"' : ' title="" sourceurl="' + jsonFace.sourceurl + '"';
					cstyle	= style + 'border:1px solid #F6FBFE;border-left:1px solid #DFEFF8;border-bottom:1px solid #DFEFF8;background:#F6FBFE;' + (j<=6 ? 'border-top:1px solid #DFEFF8;' : '') + (j%6==0 ? 'border-right:1px solid #DFEFF8;' : '');

					self.chatElement.find('.' + groupClass).append('<img src="' + jsonFace.url + '" ' + alt + ' border="0" style="' + cstyle + '" />');
				});
				//组标签
				if( i == 0 ){
					$({className: 'chat-view-face-tag ' + tagClass + ' tag-selected', title: cFace.name, index: '0', style:$.STYLE_NBODY + 'zoom:1;margin:0 5px 0 0;float:left;background:#fff;position:relative;top:-1px;border-left:1px solid #D4D4D4;border-right:1px solid #D4D4D4;'}).appendTo(self.chatElement.find('.chat-view-face-tags')).append('<img src="' + cFace.icon + '" border="0" style="' + style + 'border:none;" />');
				}else{
					$({className: 'chat-view-face-tag ' + tagClass, title: cFace.name, index: i, style:$.STYLE_NBODY + 'zoom:1;margin:0 5px 0 0;float:left;position:relative;top:0px;border-left:1px solid #f1f1f1;border-right:1px solid #f1f1f1;'}).appendTo(self.chatElement.find('.chat-view-face-tags')).append('<img src="' + cFace.icon + '" border="0" style="' + style + 'border:none;" />');
				}
			});
			//bind face event
			this.chatElement.find('.chat-view-face-group').hover(function(event){
				$.Event.fixEvent(event).stopPropagation();
				var srcElement = $.Event.fixEvent(event).target;

				if( srcElement.tagName.toLowerCase() !== 'img' ) return;
				$(srcElement).css({
					'cursor': 'pointer',
					"background-color": '#FFF'
				});
			}, function(event){
				$.Event.fixEvent(event).stopPropagation();
				var srcElement = $.Event.fixEvent(event).target;

				if( srcElement.tagName.toLowerCase() !== 'img' ) return;
				$(srcElement).css({
					"background-color": '#F6FBFE'
				});
			}).click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				var srcElement = $.Event.fixEvent(event).target;

				if( srcElement.tagName.toLowerCase() !== 'img' ) return;

				self.chatElement.find('.chat-view-window-face').display();
				if( $(this).indexOfClass('chat-view-face-group-0') ){
					//select default face
					self._insertText('[' + $(srcElement).attr('title') + ']');
				}else{
					$.Log('selected current face:' + $(srcElement).attr('sourceurl'));
					//current faces
					self.mode.send({
						type:		2,
						emotion:	1,
						msg:		"current face",
						url:		$(srcElement).attr('src'),
						sourceurl:	$(srcElement).attr('sourceurl'),
						oldfile:	"",
						size:		"",
						extension:	""
					});
				}
			});

			//tag event bind
			this.chatElement.find('.chat-view-face-tags').hover(function(event){
				$.Event.fixEvent(event).stopPropagation();
				var srcElement = $.Event.fixEvent(event).target;
				srcElement = srcElement.tagName.toLowerCase() == 'img' ? srcElement.parentNode : srcElement;

				if( !$(srcElement).indexOfClass('chat-view-face-tag') || $(srcElement).indexOfClass('tag-selected') ) return;

				$(srcElement).css({
					'background-color':	'#fafafa',
					'top':				'-1px',
					'border-left':		'1px solid #D4D4D4',
					'border-right':		'1px solid #D4D4D4',
					'margin-right':		'5px',
					'zoom':	'1'
				});
			}, function(event){
				$.Event.fixEvent(event).stopPropagation();
				var srcElement = $.Event.fixEvent(event).target;
				srcElement = srcElement.tagName.toLowerCase() == 'img' ? srcElement.parentNode : srcElement;

				if( !$(srcElement).indexOfClass('chat-view-face-tag') || $(srcElement).indexOfClass('tag-selected') ) return;

				$(srcElement).css({
					'background-color':	'transparent',
					'top':				'0px',
					'border-left':		'1px solid #f1f1f1',
					'border-right':		'1px solid #f1f1f1',
					'margin-right':		'5px',
					'zoom':	'1'
				});
			}).click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				var srcElement = $.Event.fixEvent(event).target;
				srcElement = srcElement.tagName.toLowerCase() == 'img' ? srcElement.parentNode : srcElement;

				if( !$(srcElement).indexOfClass('chat-view-face-tag') ) return;

				self.chatElement.find('.chat-view-face-tag').css({
					'background-color':	'transparent',
					'top':				'0px',
					'border-left':		'1px solid #f1f1f1',
					'border-right':		'1px solid #f1f1f1',
					'margin-right':		'5px',
					'zoom':	'1'
				}).removeClass('tag-selected');
				self.chatElement.find('.chat-view-face-group').display();

				$(srcElement).css({
					'background-color':	'#fff',
					'top':				'-1px',
					'border-left':		'1px solid #D4D4D4',
					'border-right':		'1px solid #D4D4D4',
					'margin-right':		'5px',
					'zoom':	'1'
				}).addClass('tag-selected');
				self.chatElement.find('.chat-view-face-group-' + $(srcElement).attr('index')).display(1);
			});
		},
		/**
		 * 消息内容过滤,表情转换，url转换
		 * @return {[type]}
		 */
		_contentFilter: function(data){
			//if( (typeof data.msg !== 'string' || /<.*?\>/gi.test(data.msg)) ){
			if( typeof data.msg !== 'string' || (/<.*?\>/gi.test(data.msg)) || data.type == 7 || data.type == 10){

				//2015.03.28 添加消息内容中含图片时，默认显示小图，点击后显示大图
				if( (data.type === 1 || data.type == 7 || data.type == 10) && /<img(.*?)src=([^\s]+)(.*?)>/gi.test( data.msg ) ){
					data.msg = data.msg.replace(/<img(.*?)src=([^\s]+)(.*?)>/gi, '<img class="ntalk-preview" '+ (data.type == 7 ? " robotImg='true' " : "") +'src="' + $.imageloading + '" sourceurl=$2 style="' + $.STYLE_NBODY + '" />');
				}

			if(data.type == 7 || data.type == 10) {
				data.msg = $.utils.handleLinks(data.msg, null, 'p4');
				data.msg = this._faceFilter(data.msg);
			}

				return data;
			}
			data.msg = data.msg.replace(/[\r\n]/ig, ' <br>');
			if(data.msg && data.msg.indexOf('xnlink') === -1) {
			data.msg = data.msg.replace(/(\s{2})/ig, ' {$null}');
			}

			//2015.09.22 替换连接
			data.msg = $.myString(data.msg).linkFilter1($.STYLE_BODY + 'color:#0a8cd2;');
			data.msg = data.msg.replace(/\{\$null\}/ig, '&nbsp;&nbsp;');
			data.msg = data.msg.replace(/\t/ig, '&nbsp;&nbsp;&nbsp;&nbsp;');
			//机器人快速回复连接
			data.msg = $.utils.handleLinks(data.msg, {
				settingid: this.settingid
			});
			data.msg = this._faceFilter(data.msg);
			//添加消息默认样式
			data = $.extend({
				color:		"000000",
				fontsize:	"12",
				bold:		"false",
				italic:		"false",
				underline:	"false"
			}, data);
			//$.Log('message data:' + $.JSON.toJSONString(data), 2);

			return data;
		},
		_faceFilter: function(str){
			var m = str.match(/\[([a-z]+)\]/ig),
				_gIndex = function(text){
					var ret = null;
					$.each($.lang.editorFaceAlt, function(k, ftext){
						if( ftext && new RegExp(text.replace(/\[/,"\\[").replace(/\]/,"\\]"), "gi").test('[' + ftext + ']') ) ret = k;
					});
					return ret;
				};
			if( !m || !str ){
				return str;
			}
			for(var k, i=0; i<m.length; i++){
				if( !(k = _gIndex(m[i]) ) ){
					continue;
				}
				str = str.replace(m[i], '<img src="' + $.sourceURI + 'images/faces/' + k + ($.browser.msie6 ? '.gif' : '.png') + '" style="' + $.STYLE_NBODY + 'width:23px;height:23px;margin:0 2px;display:inline;vertical-align:text-bottom;" />');
			}
			return str;
		},
		/**
		 * [_image description]
		 * @return {[type]}
		 */
		_image: function(){

		},
		/**
		 * [_file description]
		 * @return {[type]}
		 */
		_file: function(){

		},
		/**
		 * 下载聊天记录
		 * @return {[type]}
		 */
		_download: function(){
			if( !this.mode.download ){
				return;
			}
			this.mode.download(this.settingid);
		},
		/**
		 * @method _viewHistory 查看聊天记录(2014.11.11)
		 * @params {Boolean}  showView 查看聊天记录或关闭聊天记录
		 * @return {[type]}
		 */
		_viewHistory: function(showView){
			if( !this.mode.viewHistory ){
				return;
			}
			if( showView ){
				this.chatElement.find('.chat-view-load-history').attr('selected', 'selected').css('background-position', '-220px -60px');
			}else{
				this.chatElement.find('.chat-view-load-history').attr('selected', '').css('background-position', '-220px -40px');
			}

			//聊天窗口头
			this._tempHeader.display(!showView);
			//聊天记录头
			this._chatsHeader.display(showView);

			this._chatsElement.css({
				height: this.chatHistory.height() + 'px'
			}).display(showView);

			if( showView ){
				this.mode.viewHistory(this.settingid, this._chatsElement.find('IFRAME.chat-view-float-iframe').get(0));
			}
		},
		/**
		 * 评价
		 * @return {[type]}
		 */
		_evaluate: function(){
			if( !this.mode.showEvaluation ){
				return;
			}
			this.mode.showEvaluation();
		},
		/**
		 * 开始截图
		 * @return {[type]}
		 */
		_capture: function(){
			if( !this.mode.startCapture ){
				return;
			}
			this.mode.startCapture(this.settingid);
		},
		/**
		 * @method _switchManual 转人工客服
		 */
		_switchManual: function(){
			if( !this.mode.switchServerType ){
				return;
			}

			this.mode.switchServerType(true, this.settingid);
		},
		/**
		 * @method _changeCsr 更换客服
		 */
		_changeCsr: function(){
			if( !this.mode.changeCustomerServiceInfo ) {
				return;
			}
			this.mode.changeCustomerServiceInfo();
		},
		/**
		 * 展开或收缩侧边栏
		 * @param {event} event
		 * @return {void}
		 */
		_expansion: function(event){

			this.options.toggleExpansion(this.settingid);
		},
		updateMore: function(extend){
			//2016.03.11更改更多后面的箭头
			this.chatElement.find('.chat-view-exp').html($.lang.button_more + (extend ? ' &gt;' : ' &gt;') );
		},
		/**
		 * @method switchToolbar 工具条效果转换，人工客服工具条与机器人工具条
		 * @param {boolean} 是否转换为人工客服工具条
		 * @param {string}  source       来源
		 */
		switchToolbar: function(manual, source){
			var self = this;
			$.Log('nTalk.chat.view.switchToolbar(' + manual + ')');
			if( manual ){
				this.chatElement.find('.chat-view-button,.chat-view-capture-options').each(function(){
					var captureOption = $(this).indexOfClass('chat-view-capture-options');
					//2015.12.18 修正按钮显隐判断bug
					if( (!captureOption && $(this).attr('talk_disable') != 'disable' ) ||
						(captureOption && self.chatElement.find('.chat-view-capture').css('display') == "block") ){
						$(this).display(1);
					}
				});
				this.displayButton('csr', this.mode.config.changecsr != 1);
				this.displayButton('history', this.mode.config.chatingrecord != 1);
				this.displayButton('loadhistory', this.mode.config.viewchatrecord != 1);
				this.displayButton(['capture','capoptions'], this.mode.config.captureimage == 0 || !$.global.pageinchat);
				this.displayButton('evaluate', this.mode.config.evaluation == 0);
				this.chatElement.find('.chat-view-exp').display(this.mode._moreData && this.mode._moreData.length);
				this.chatElement.find('.chat-view-switch-manual').display();
			}else{
				this.chatElement.find('.chat-view-button,.chat-view-capture-options').each(function(){
					$(this).display();
				});
				this.chatElement.find('.chat-view-exp').display(this.mode._moreData && this.mode._moreData.length);
				//机器人转人工按钮默认1
				this.chatElement.find('.chat-view-switch-manual').display(0);
				/*
				if( /OFFLINE|BUSY/i.test(source) ){
					//由客服忙碌、离线转向机器人客服时，不能再转向人工客服
					this.disableButton('manual', true);
				}
				*/
			}
		},
		/**
		 * 发送消息
		 * @return {void}
		 */
		_send: function(isSubmit){
			this.chatElement.find('.chat-view-hidden-area .chat-view-suggest-list').display();
			this.isRobotSuggest = true;
			if( /QUERY|QUEUE/i.test(this.mode.statusConnectT2D) ){
				return false;
			}
			var textContent = this._clearEditor();
			if( textContent.length && textContent != $.lang.default_textarea_text ){
				//加载默认文本
				this.mode.send( textContent );
			}

			if( !$.browser.html5 && isSubmit === true ){
				this.textEditor.css({'color': '#ccc'}).val( $.lang.default_textarea_text ).get(0).focus();
			}

			$.fn.isReaded();
		},
		_endSession: function(){
			this.mode.endSession();
		},
		_clearEditor: function(){
			var textContent = this.textEditor.val().replace(/(^\s*)|(\s*$)/g, "");
			this.textEditor.val('');
			return textContent;
		},
		/**
		 * @method callChatResize 会话窗口resize
		 * @return {void}
		 */
		callChatResize: function(width, height){
			//$.Log('nTalk.chatMode.view.callChatResize(' + width + ', ' + height + ')');

			//消息区宽、高
			this.chatHistory.find('ul').css({'width':  (width - 2) + 'px'});
			//2016.03.11更改高度将165改为135
			this.chatHistory.css({'height': (height - 135) + 'px'});
			this.chatElement.find('.chat-view-float-history, .chat-view-float-history iframe').css({'height': (height - 135) + 'px'});
			this.chatElement.find('.chat-view-window-status-info').css('width', (width - 40) + 'px' );

			if( this.evalDialog ){
				this.evalDialog.resize();
			}
			//输入框宽
			this.textEditor.css({
				'width': (width - 22) + 'px'
			});

			//更新滚动条
			if( this.scroll ){
				this.scroll.resizeScroll();
			}
		},

        /**
         * 更改排队样式
         */
        changeQueueStyle: function() {
           return false;
        },

        /**
		 * audio view 回调
		 * @param {Object} msgid 消息id
		 * @param {Object} type 需要回调type (init|play|stop)
		 */
		audioView: function(type) {
		    /*
		     * 如果没有传递msgid且musicEl存在，改变musicEl的状态
		     */
		    if (!this.msgid && $.musicEl) {
		        $.musicEl.emit();
		        $.musicEl = null;
		        return;
		    }

		    var self = this;
		    var img, msgid = self.msgid;
		    var duration = self.duration;
		    var bodyEl = $('.' + msgid).find('.view-history-body');
		    var kf = msgid.toLowerCase().indexOf("j") > -1 ? false : true;
		    var pngArs, gifArs, bgColor, borderColor, align;
		    if (kf) {
		        pngArs = $.sourceURI + 'images/kfSound.png';
		        gifArs = $.sourceURI + 'images/kfSound.gif';
		        bgColor = '#FFFFFF';
		        align = 'right';
		        durationAlign = 'left';
		    } else {
		        pngArs = $.sourceURI + 'images/mySound.png';
		        gifArs = $.sourceURI + 'images/mySound.gif';
		        bgColor = '#CEF2FF';
		        align = 'left';
		        durationAlign = 'right';
        }

		    switch (type) {
		        case "init":
		            $.Log('[nTalk music]: mp3 view init, msgid is ' + msgid);
		            var html = ['<div id="duration_', msgid, '" style="', $.STYLE_BODY, 'height:24px;line-height:24px;padding:4px 4px 0px;float:', durationAlign, '" >', duration, '\'\'</div>',
		                '<div id="player_', msgid, '" style="', $.STYLE_BODY, ' width:80px;height:24px;padding:4px 0;background:', bgColor, ';border-radius:5px;border: none;text-align:', align, '">',
		                '<img width="24px" height="24px" src="', pngArs, '"/>', '</div>'].join("");
		            bodyEl.parent().css('padding', '0px');
		            bodyEl.append(html);
		            if ($.browser.msie && $.browser.ieversion <= 7) {
		                $('#player_' + msgid).css('width', '50px');
		                $('.' + msgid).find('table').css('width', '100px');
		            }

		            break;
		        case "play":
		            $.Log('[nTalk music]: mp3 view play, msgid is ' + msgid);
		            if ($.musicEl) {
		                $.Log('[nTalk music]: stop playing mp3 view, msgid is ' + $.playMsgid, 2);
		                $.musicEl.emit();
		            }
		            $.musicEl = self;
		            img = $('#player_' + msgid + ' img')[0];
		            img.src = img.src.replace("png", "gif");
		            break;
		        case "stop":
		            $.Log('[nTalk music]: mp3 view stop, msgid is ' + msgid);
		            $.musicEl = null;
		            img = $('#player_' + msgid + ' img')[0];
		            img.src = img.src.replace("gif", "png");
		            break;
		    }
		},

		/**
		 *
		 * @param {Object} msgid
		 */
		audioBindEvent: function(type) {
		    var msgid = this.msgid;
		    switch (type) {
		        case "init":
		            $.Log('[nTalk music]: mp3 event init, msgid is ' + msgid);
		            var self = this;
		            var player = $('#player_' + msgid);
		            player.click(function() {
		                $.Log('[nTalk music]: mp3 trigger click, msgid is ' + msgid);
		                self.emit();
		            });
		            break;
		    }
		}
	};

	/** ====================================================================================================================================================
	 * 最小化窗体状态条
	 * @type {class}
	 */
	$.minimizeView = $.Class.create();
	$.minimizeView.prototype = {
		_width:	0,
		_height:0,
		_isMessageView: false,
		element: null,
		title:	'',
		status: 0,
		count:  0,
		initialize: function(dest, isMessageView, callback){
			var self = this;
			$.Log('new nTalk.minimizeView()', 1);
			this.status = dest.status || 0;
			this._isMessageView = isMessageView;
			this.callback = callback || new Function();
			this.element = $('.ntalk-minimize-window');
			this._width = 158;
			this._height= 44;

			if( !this.element.length ){
				this.element = $({className:'ntalk-minimize-window', style:$.STYLE_BODY + 'width:' + (this._width - 2) + 'px;height:' + (this._height - 2) + 'px;border:1px solid #e3e3e3;background:#f5f5f5;cursor:pointer;z-Index:2000000000;border-radius: 2px 0 0 2px;'}).appendTo(true)
				.gradient('top', '#e5e5e4', '#f2f3f3').fixed({
					left: $(window).width()  - this._width - 2,
					top:  $(window).height() - this._height- 2 -20
				}).html( [
						'<div class="ntalk-minimize-icon" style="',$.STYLE_BODY,'float:left;margin:7px 5px;_margin:4px 4px;width:30px;height:30px;background:url(',$.imageicon,') no-repeat -383px -8px;"></div>',
						'<div class="ntalk-minimize-title" style="',$.STYLE_BODY,'float:left;margin:4px 0;line-height:35px;overflow:hidden;width:auto;height:35px;max-width:120px;font-family: MicrosoftYaHei;font-size: 13px;color: #333333;"></div>',
						'<div style="',$.STYLE_NBODY,'clear:both;"></div>'
				].join('') );
			}

			//定位
			$(window).bind('resize', function(event){
				self._fiexd(event);
			});

			this.update(dest.name || '', dest.logo || '');

			if( this.status ){
				this.online();
			}else{
				this.offline();
			}

			this.element.click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				self.remove();
			});
		},
		/**
		 * @method online 更改为在线状态
		 * @return {void}
		 */
		online: function(){
			this.element.find('.ntalk-minimize-icon').css('opacity', 1);
		},
		/**
		 * @method offline 更改为离线状态
		 * @return {void}
		 */
		offline: function(){
			this.element.find('.ntalk-minimize-icon').css('opacity', 0.5);
		},
		/**
		 * @method update 更新状态条信息
		 * @return {void}
		 */
		update: function(name, logo){
			this.title = name ? $.utils.handleLinks($.lang.toolbar_min_title, {destname: name}) : $.lang.toolbar_default_text;
			this.element.find('.ntalk-minimize-title').html( this.title );

			if( logo && logo != $.CON_SINGLE_SESSION ){
				var self = this, attr;
				$.require(logo + '#image', function(image){
					if( image.error ){
						$.Log('load logo:' + logo, 2);
						return;
					}
					attr = $.zoom(image, 30, 30);
					self.element.find('.ntalk-minimize-icon').css('background-position', '-500px -8px').html( '<img src="' + logo + '" width="' + attr.width + '" height="' + attr.height + '" style="' + $.STYLE_NBODY + 'margin:' + (30-attr.height)/2 + 'px ' + (30-attr.width)/2 + 'px;width:' + attr.width + 'px;height:' + attr.height + 'px;border-radius:50%;" />' );
				});
			}else{
				this.element.find('.ntalk-minimize-icon').css('background-position', '-383px -8px');
			}
		},
		/**
		 * @method remove 关闭状态条
		 * @return {void}
		 */
		remove: function(){
			$(window).removeEvent('resize', this._fiexd);
			this.stopFlicker();
			this.element.remove();
			this.callback();
		},
		/**
		 * @method startFlicker 收到消息时，开始闪烁
		 * @param  {boolean} highlight
		 * @param  {number}  count
		 * @return {void}
		 */
		startFlicker: function(highlight, count){
			var self = this,
				messageCount = this.count > 99 ? '99+' : this.count,
				timeout = highlight ? 1000 : 500
			;
			count = count || 0;
			if( highlight === undefined ){
				this.stopFlicker(true);
			}

			$.Log('$.minView.startFlicker(' + $.JSON.toJSONString(arguments) + ') timeid:' + this.timeID, 1);
			if( highlight ){
				this.element.css({
					'border-color': '#d55f01'
				}).gradient('top', '#ff8803', '#ff7b16');
			}else{
				this.element.css({
					'border-color': '#c8c7c6'
				}).gradient('top', '#e5e5e4', '#f2f3f3').find('.ntalk-minimize-title').html( $.utils.handleLinks($.lang.toolbar_min_news, {count: '<span style="' + $.STYLE_BODY + 'color:#fff;font-weight:bold;">' + messageCount + '</span>'}) );
			}
			if( count >= 7 ) return;

			this.timeID = setTimeout(function(){
				count++;
				self.startFlicker(!highlight, count);
			}, timeout);
		},
		/**
		 * @method stopFlicker 终止闪烁
		 * @param  {boolean}   startNewFlicker 开始新闪烁时终止
		 * @return {void}
		 */
		stopFlicker: function(startNewFlicker){
			$.Log('$.minView.stopFlicker()', 1);
			clearTimeout(this.timeID);
			this.timeID = null;
			if( !startNewFlicker ){
				this.count = 0;
			}
			this.element.find('.ntalk-minimize-icon').css('background-position', '-98px -38px');
			this.element.css({
				'border-color': '#d55f01'
			}).gradient('top', '#e5e5e4', '#f2f3f3').find('.ntalk-minimize-title').html( this.title );
		},
		_fiexd: function(event){
			this.element = $('.ntalk-minimize-window');
			if( !this.element || !this.element.length ){
				return;
			}
			var width = this.element.width();
			var height = this.element.height();
			this.element.fixed({
				width:  width - 2,
				height: height - 2,
				left:	$(window).width()  - width  - 2,
				top:	$(window).height() - height - 2
			});
		}
	};

	$.fn.extend({
        isReaded: function() {
        	if($.chatManage && $.chatManage.get() && $.chatManage.get().view && $.chatManage.get().view.receiveMsgCount) {
        		$.chatManage.get().view.receiveMsgCount = 0;
        	}
    	    if($.im){
    			$.im.receiveMsgCount = 0;
    		}
            if( typeof window.webInfoChanged == "function" ) {
            	webInfoChanged(400, '{"num":0, "showNum":1}', false);
            }
        }
    });

	/** ====================================================================================================================================================
	 * [chatManageView description]
	 * @type {[type]}
	 */
	$.chatManageView = $.Class.create();
	$.chatManageView.prototype = {
		name: 'chatManageView',
		defaultOptions: {
			//2017.05.24更改窗口大小
			dropHeight: 48,
			width:  450, //聊天窗口区域宽
			height: 472, //聊天窗口区域高
			minWidth: 415,//最小聊天窗口宽
			minHeight:518,//最小聊天窗口高
			leftElementWidth:  140,//聊窗标签区域宽
			rightElementWidth: 200,//聊窗侧边栏宽
			resizeHeight: 595,     //
			drag:   true,
			resize: false,
			fixed:  true,
			zIndex: 1000000
		},
		_flickerTimeID: [],
		_objView:  null,
		_manageMode: null,
		//当前窗体标识、标题
		tagKey: '',
		tagTitle: '',
		extended: null,
		options: null,
		header: null,
		body: null,
		leftContent: null,
		leftElement: null,
		chatBody: null,
		chatContainter: null,
		rightElement: null,

		chatWidth: 0,
		chatHeight: 0,
		CON_ICON_WIDTH: 53,
		CON_ICON_HEIGHT:53,
		initialize: function(options, manageMode){
			this.options = $.extend({}, this.defaultOptions, options);

			this.extended = {
				leftElement: false,
				rightElement: false
			};

			this._manageMode = manageMode;

			this._getChatPosition(options.position || {});

			this._create();

			this._bind();
		},
		close: function(){
			$.Log('nTalk.chatManageView.close()', 1);
			try{
				if( $.browser.oldmsie ){
					this._objView.containter.display();
				}else{
					this._objView.containter.remove();
				}
			}catch(e){
				$.Log(e, 3);
			}
		},
		/**
		 * 添加标签
		 * @param {string} settingid 聊窗标签key
		 */
		addChatTag: function(settingid){
			var self = this, chatTag;

			if( !this.leftContent ){
				return;
			}
			this.tagKey = settingid;
			this.tagTitle = $.lang.toolbar_default_text;
			chatTag = $({tag:'li', style: $.STYLE_NBODY + 'margin:5px 0 0 5px;list-style:none;border:1px solid #fafafa;border-right:none;position:relative;cursor:pointer;', className: this.tagKey, key: this.tagKey}).appendTo(this.leftContent)
				.html( [
					'<div class="tag-head-icon" style="',$.STYLE_NBODY,'width:12px;height:12px;overflow:hidden;position:absolute;left:0;margin:11px 0px 11px 11px;background:#666;"></div>',
					'<div class="tag-content-text" style="',$.STYLE_BODY,'margin-left:30px;height:35px;line-height:35px;overflow:hidden;font-family: MicrosoftYaHei;">', this.tagTitle,'</div>',
					'<div class="tag-button-close" style="',$.STYLE_NBODY,'width:15px;height:15px;position:absolute;left:110px;top:10px;"></div>'
			].join('') ).click(function(event){
				self._onSwitchChat(this, event);
			}).hover(this._onOverChatTag, this._onOutChatTag);

			this._onSelectedChatTag(chatTag);

			chatTag.find('div.tag-button-close').click(function(event){

				self._onCloseChatTag(this, event);
			});

			if( this.leftContent.find('li').length > 1 && !this.extended.leftElement ){
				//展示左侧边栏
				this.toggleExpansion('leftElement', true);
			}

			//左侧边栏滚动到最底端
			this.leftBody.scrollTop( this.leftBody.scrollHeight() );

			return;
		},
		/**
		 * 移除标签
		 * @param  {string} settingid
		 * @return {void}
		 */
		removeChatTag: function(settingid){
			this.leftContent.find('li.'+settingid).remove();

			if( this.leftContent.find('li').length <= 1 && this.extended.leftElement ){
				//隐藏侧边栏
				this.toggleExpansion('leftElement', false);
			}
			return;
		},
		/**
		 * 更新当前聊窗状态\客服信息
		 * @param  {string} settingid
		 * @param  {json}   data
		 * @param  {boolean}updateStatus	只更新多聊窗时侧边栏客服状态
		 * @return
		 */
		updateChatTag: function(settingid, data, updateStatus){
			var attr, signWidth,
				icon = this.header.find('.chat-header-icon'),
				name = this.header.find('.chat-header-name'),
				sign = this.header.find('.chat-header-sign')
			;
			this.leftContent.find('li.'+settingid+' .tag-head-icon').css('background-color', data.status!==1 ? '#666' : '#01B8EF');

			if( updateStatus === true ) return;

			this.leftContent.find('li.'+settingid+' .tag-content-text').html( data.id == $.CON_SINGLE_SESSION ? $.lang.toolbar_default_text : data.name);

			if( !data.id ){
				this.header.find(".chat-header-icon,.chat-header-name,.chat-header-sign").css('visibility', 'hidden');
				return;
			}
			//$.Log('chatManageView.updateChatTag(' + $.JSON.toJSONString(data) + ')');

			if( $.CON_MULTIPLAYER_SESSION === data.logo ){
				data.logo = $.imagemultiplayer;
			}else if( $.CON_SINGLE_SESSION === data.logo ){
				data.logo = $.imagesingle;
			}
			//$.Log('user icon attr:' + $.JSON.toJSONString(data));
			icon.css('visibility', 'visible').css('background-image', 'none');

			//2015.01.15 排队时，每3秒更新一次用户信息,避免重新更新
			if( !icon.find('img').length || icon.find('img').attr('src') != data.logo ){
				icon.html( '<img data-single="1" onerror="nTalk.loadImageAbnormal(this, event)" src="' + data.logo + '" border="0" width="' + data.attr.width + '" height="' + data.attr.height + '" style="' + $.STYLE_NBODY + 'margin:' + (this.CON_ICON_HEIGHT - data.attr.height)/2 + 'px ' + (this.CON_ICON_WIDTH - data.attr.width)/2 + 'px;width:' + data.attr.width + 'px;height:' + data.attr.height + 'px;background:#fff;" />' );
			}else{
				icon.find('img').attr({
					'data-single': $.CON_MULTIPLAYER_SESSION != data.logo ? '1' : '0',
					'width': data.attr.width,
					'height':data.attr.height
				}).css({
					margin:(this.CON_ICON_HEIGHT - data.attr.height)/2 + 'px ' + (this.CON_ICON_WIDTH - data.attr.width)/2 + 'px',
					width:  data.attr.width + 'px',
					height: data.attr.height + 'px'
				});
			}

			if( data.status==0 && $.CON_SINGLE_SESSION !== data.id ){
				icon.find('img').css('opacity', '0.5');
			}else{
				icon.find('img').css('opacity', '1');
			}
			//2016.03.21 修改name的值增加在线客服的字样
			name.css('visibility', 'visible').html( '\u5728\u7ebf\u5ba2\u670d\u002d'+data.title || '\u5728\u7ebf\u5ba2\u670d\u002d'+data.name );
			signWidth = Math.max(0, this.header.width() - name.width() - 95);
			sign.css('visibility', 'visible').attr('title', data.sign).css('width', signWidth + 'px').html( data.sign );
		},
		/**
		 * 切换标签
		 * @param  {String} settingid
		 * @return {void}
		 */
		switchChatTag: function(settingid){
			var tagLi = $('li.'+settingid, this.leftContent);

			if( tagLi.length ){
				this._onSelectedChatTag(tagLi);
			}

			this._manageMode.callSwitchChat(settingid);
		},
		/**
		 * 展开或收缩左或右侧边栏
		 * @param  {string} attr leftElement|rightElement
		 * @param  {boolen} extend
		 * @return {boolean}
		 */
		toggleExpansion: function(attr, extend){
			if( $.inArray(['leftElement', 'rightElement'], attr) === false ){
				attr = "leftElement";
			}

			extend = $.isBoolean(extend) ? extend : !this.extended[attr];
			if( attr === 'rightElement' ){
				if( extend ){
					this[attr].css({
						width:   this.options.rightElementWidth + 'px',
						display: 'block'
					});
					this.chatWidth = this.options.width + this.options.rightElementWidth;
				}else if( !extend ){
					this[attr].css({
						width:   this.options.rightElementWidth + 'px',
						display: 'none'
					});
					this.chatWidth = this.options.width;
				}
				this.extended[attr] = extend;
				this.chatHeight= this.options.height + this.options.dropHeight;
				this.chatWidth += this.extended.leftElement ? this.options.leftElementWidth : 0;
			}else{
				if( extend ){
					this.chatWidth = this.options.width + this.options.leftElementWidth;
					this[attr].css('display', 'block');
					this.chatContainter.css('border-bottom-left-radius', '0px');
				}else if( !extend ){
					this.chatWidth = this.options.width;
					this[attr].css('display', 'none');
					this.chatContainter.css('border-bottom-left-radius', '5px');
				}
				this.extended[attr] = extend;
				this.chatWidth += this.extended.rightElement ? this.options.rightElementWidth : 0;
			}

			//设定最小宽度
			this._objView.minWidth = this.defaultOptions.width + (this.extended.leftElement ? this.options.leftElementWidth : 0) + (this.extended.rightElement ? this.options.rightElementWidth : 0);

			this.headBody.css('width', this.chatWidth + 'px');
			this.body.css('width', (this.chatWidth - (this.extended.rightElement ? this.options.rightElementWidth : 0) ) + 'px');

			this._objView.changeAttr(this.chatWidth, this.chatHeight);

			return this.extended[attr];
		},
		/**
		 * 更新聊窗当前右侧数据
		 * @param  {string} settingid
		 * @param  {array}  data
		 * @return {[type]}
		 */
		updateRightData: function(settingid, data){
			var self = this, selectLabel = false;

			this.settingid = settingid;

			if( !data || !data.length ){
				//页外时,无右侧配置数据时,不显示右侧区域
				this.toggleExpansion("rightElement", false);

				return;
			}

			this._clearTag();

			$.each(data, function(i, obj){
				if( !obj.data || !obj.data.length ){
					return;
				}
				if( obj.selected == true ){
					selectLabel = true;
				}

				//默认选择项内容为空或无默认选项时，最后一项为选中项
				if( !selectLabel && i == data.length - 1 ){
					obj.selected = true;
				}
				self._addRightLabel(obj.title, obj.data, data.length, obj.selected);
			});
			this._bindTag();
		},
		/**
		 * @method updateViewStatus 更新ManageView状态效果
		 * @param  {boolean} status
		 * @return {void}
		 */
		updateViewStatus: function(status){
		},
		/**
		 * @method updataSkin 更新聊窗皮肤
		 * @param  {string} backgroundImage
		 * @param  {string} startColor
		 * @param  {string} endColor
		 * @return {void}
		 */
		updataSkin: function(backgroundImage, startColor, endColor){
			var chat, colorExp = /^#[0-9a-f]{6}$/i;
			//2016.03.04新增皮肤颜色
		  startColor=endColor='#01B8EF';

			if( startColor == endColor ){
				//自定义皮肤
				if( colorExp.test(startColor) ){
					//背景颜色
					var hsl = $.toHSL(startColor).l;
					this.headBody.css({
						'background':	startColor,
						'color':		hsl < 0.75 ? '#fff' : '#525252'
					});
					this.rightElement.find('.window-right-head').css({
						'background':	startColor,
						'color':		hsl < 0.75 ? '#fff' : '#525252'
					});
				}else{
					//背景图片
					this.headBody.css({
						'background':	'url(' + startColor + ') repeat'
					});
					this.rightElement.find('.window-right-head').css({
						'background':	'url(' + startColor + ') repeat'
					});
				}
			}else{
				//默认皮肤
				this.headBody.gradient("top", startColor, endColor);
				this.rightElement.find('.window-right-head').gradient("top", startColor, endColor);
			}

			chat = this._manageMode.get();
			if( chat && colorExp.test(backgroundImage) ){
				chat.view.chatElement.find('.chat-view-window-history').css("background-color",backgroundImage);
			}else if( chat && backgroundImage ){
				chat.view.chatElement.find('.chat-view-window-history').css("background-image",'url('+backgroundImage+')');
			}
		},
		minimize: function(event){
			this._objView.minimize(event);
		},
		maximize: function(event){
			this._objView.maximize(event);
		},
		hidden: function(){
			this._objView.minimize(null, true);
			$.Log('chatManageView.hidden:' + this._objView.containter.css('visibility'), 2);
		},
		visible: function(){
			this._objView.maximize(null, true);
			$.Log('chatManageView.visible:' + this._objView.containter.css('visibility'), 2);
		},
		/**
		 * 收到消息时，开始闪烁
		 * @param  {string}  selector 选择器
		 * @param  {boolean} highlight
		 * @param  {number}  count
		 * @return {void}
		 */
		labelFlicker: function(selector, highlight, count){
			var self = this, timeout = highlight ? 1000 : 500;
			count = count || 0;
			if( highlight === undefined ){
				this.stopFlicker(selector);
			}

			if( highlight ){
				this.leftContent.find("." + selector).css({
					'background-color': '#FE800F'
				}).addClass('talk_flicker');
			}else{
				this.leftContent.find("." + selector).css({
					'background-color': '#fafafa'
				}).addClass('talk_flicker');
			}
			if( count >= 7 ) return;

			this._flickerTimeID[selector] = setTimeout(function(){
				count++;
				self.labelFlicker(selector, !highlight, count);
			}, timeout);
		},
		stopFlicker: function(selector){
			clearTimeout(this._flickerTimeID[selector]);
			this._flickerTimeID[selector] = null;

			this.leftBody.find("." + selector).css({
				'background-color': '#fafafa'
			}).removeClass('talk_flicker');
		},
		/**
		 * 创建聊窗管理器视图界面
		 * @return {[type]}
		 */
		_create: function(){
			var self = this, options = $.extend({}, this.options, {
				width:  this.options.width,
				height: this.options.height + this.options.dropHeight,
				minWidth: this.defaultOptions.minWidth,
				minHeight:this.defaultOptions.minHeight
			});
			//2016.03.10添加主题文件
				if ($.themesURI) {
			    $.imageicon = $.themesURI + 'chaticon.' + ($.browser.msie6 ? 'gif' : 'png');

			   //预加载图片
			    $.require([$.imageicon], function(element) {
			        if (element.error) {
			            $.Log('cache chat icon failure', 3);
			        }
			    });

			}

			this._objView = new $.Window( $.extend({
				onChanage: function(args){
					self._callResize.call(self, args);
				},
				onClose: function(){
					self._callClose.call(self);
				},
				onMinimize: function(){
					self._callMinimize.call(self);
				},
				onMaximize: function(){
					self._callMaximize.call(self);
				},
				onMaxResize: function(){
					self._callMaxResize.call(self);
				}
			}, options) );

			this.header = this._objView.header;
			this.body   = this._objView.body;

			this.chatWidth = this.options.width;
			this.chatHeight= this.options.height + this.options.dropHeight;

			this._objView.buttonClose.hover(function(){
				//$(this).css('background-position', '-60px -20px');
				//2016.03.15
				$.Event.fixEvent(event).stopPropagation();
				$(this).css('background-color','#007CAE');
			}, function(){
				//$(this).css('background-position', '-60px 0');
				$.Event.fixEvent(event).stopPropagation();
				$(this).css('background-color','');
			}).attr('title', $.lang.chat_button_close).css({
				'margin': '0',
				'width':'12px',
				'height': '12px',
				'padding': '11px 11px',
				'background': 'url('+ $.themesURI + 'buttonClose.png' +') no-repeat center center'
			});
			if( this._objView.buttonResize ){
				this._objView.buttonResize.css({
					'width':  '12px',
					'height': '15px',
					'background': 'url(' + $.imageicon + ') no-repeat -298px -5px'
				});
			}
			this._objView.buttonMax.hover(function(event){
				//var positionX = $(this).css('background-position').split(' ').shift();
				//$(this).css('background-position', positionX + ' -20px');
				$(this).css('background-color','#007CAE');

			}, function(event){
				//var positionX = $(this).css('background-position').split(' ').shift();
				//$(this).css('background-position', positionX + ' 0');
				$(this).css('background-color','');
			}).css({
				'margin': '0',
				'width':'12px',
				'height': '12px',
				'padding': '11px 11px',
				'background': 'url('+ $.themesURI + 'buttonMax.png' +') no-repeat center center'
			}).attr('title', $.lang.chat_button_resize_max);
            //2016.03.15更改
			this._objView.buttonMin.hover(function(){
				//$(this).css('background-position', '-1px -20px');
				$(this).css('background-color','#007CAE');
			}, function(){
				$(this).css({
					//'background-position': '7px 15px',
					'background-color':''
			});
			}).css({
				'margin': '0',
				'width':'14px',
				'height': '2px',
				'padding': '16px 10px',
				'background': 'url('+ $.themesURI + 'buttonMin.png' +') no-repeat center center'
			}).attr('title', $.lang.chat_button_min);

			this.headBody = $({className: 'chat-header-body', style: $.STYLE_BODY + 'background:#ebe9e9;z-index:0;color:#525252;'}).appendTo(this.header, true).css({
				'position': 'absolute',
				//2017-05-14更改 border背景颜色
				//'border-top': '1px solid #ff4d4d',
				'border-left': '1px solid #01B8EF',
				'border-right': '1px solid #01B8EF',
				'border-bottom': '0',
				'top': '0px',//IN
				'border-right': '1px solid #01B8EF',//IN
				//'border-radius': '5px 5px 0px 0px',
				//'-moz-border-radius': '5px 5px 0px 0px',
				//'-webkit-border-radius': '5px 5px 0px 0px',
				'width': (this.options.width - 2) + 'px',//IN
				'height': (this.options.dropHeight) + 'px'//IN
			});
			//2016.03.10 新增logo图片

			this.headPic=$({tag: 'span', className:'chat-header-pic', style: $.STYLE_BODY + 'display:inline-block;margin:16px 8px 0px 12px;height:16px;width:90px;float:left;background:url('+ $.themesURI + 'LOGO.png' + ') no-repeat center center' }).appendTo(this.headBody).html('');
			//2016.03.11更改字体颜色和margin 值
			this.headName = $({tag: 'span', className:'chat-header-name', style: $.STYLE_BODY + 'color:#ebedec;margin:16px 0px 0px 0px;display:inline-block;heigth:17px;color:#ffffff;font-size:13px;font-family: "MicrosoftYaHei";float:left;max-width:220px;visibility:hidden;overflow:hidden;cursor:auto;'}).appendTo(this.headBody);
			$({className:'chat-view-xiaoneng-version',tag:'span',style:$.STYLE_BODY+ 'display:inline-block;visibility:hidden;text-decoration:none;margin:17px 0px 0px 12px;float:left;height:16px;font-family: "MicrosoftYaHei";line-height:16px;color:#fff;opacity: 0.7;'}).html('\u5bf9\u65b9\u6b63\u5728\u8f93\u5165\u002e\u002e\u002e').appendTo(this.headBody);
			this.headSign = $({tag: 'span', className:'chat-header-sign', style: $.STYLE_BODY + 'color:#c3c3c3;margin:10px 0px 13px 10px;display:inline-block;float:left;height:20px;visibility:hidden;white-space:nowrap;text-overflow:ellipsis;cursor:auto;'}).appendTo(this.headBody);

			//2016.03.10将图片进行隐藏
			//this.headIcon = $({tag: 'div',  className:'chat-header-icon', style: $.STYLE_NBODY + 'visibility:hidden;border-radius:0px;overflow:hidden;background:url(' + $.imageicon + ');background-repeat:no-repeat;background-position:-374px 0; background-color:#ffffff;position:absolute;left:14px;bottom:13px;width:' + this.CON_ICON_WIDTH + 'px;height:' + this.CON_ICON_HEIGHT + 'px;border:1px solid #5f6467;z-index:1;'}).appendTo(this.header, true);
			//2017.05.25 添加客服输入提示

			this.chatBody = this._objView.chatBody;

			this.leftElement = $({className: 'body-chat-tags', style: $.STYLE_NBODY + 'display:none;float:left;background:#fafafa;overflow:hidden;'}).css({
				'border-left': '1px solid #f5f5f5',
				'border-bottom': '1px solid #f5f5f5',
				'border-radius': '0px 0px 0px 5px',
				'width':  (this.options.leftElementWidth - 1) + 'px',
				'height': (this.options.height - 1) + 'px'
			}).appendTo( this.chatBody );

			this.chatContainter = $({className: 'body-chat-containter', style: $.STYLE_NBODY + 'float:left;overflow:hidden;background:#fff;'}).css({
				'border-right':  '1px solid #5f6467',
				'border-bottom': '1px solid #5f6467',
				'border-left':   '1px solid #5f6467',
				'border-radius': '0px 0px 0px 5px',
				'-moz-border-radius': '0px 0px 0px 5px',
				'-webkit-border-radius': '0px 0px 0px 5px',
				'width':  (+this.options.width  - 2) + 'px',
				'height': (+this.options.height - 1) + 'px'
			}).appendTo( this.chatBody );

			//clear both
			$({style: $.STYLE_NBODY+'clear:both;'}).appendTo(this.chatBody);

			this.rightElement = this._objView.rightElement.css({
				width: this.options.rightElementWidth + 'px'
			});
			//IN:

			/*	$({className: 'ntalker-button-close', style: $.STYLE_BODY + 'background:url(' + $.imageicon + ') no-repeat -80px 0;cursor:pointer;width:20px;height:20px;float:right;color:#fff;'}).appendTo(this.rightElement.find('.window-right-head')).hover(function(){
				$(this).css('background-position', '-80px -20px');
			}, function(){
				$(this).css('background-position', '-80px 0');
			}).css({
				margin: '10px 10px 0 0'
			}).attr('title', $.lang.chat_button_close).click(function(event){

				self._manageMode.callToggleExpansion(self.settingid);
				});*/

            //2016.03.11更改边框颜色和border角
			this.rightBody = $({className: 'window-right-body', style: $.STYLE_BODY + 'width:199px;background:#fff;'}).css({
				'position': 'relative',
				'border-right':  '1px solid #f3f3f3',
				'border-bottom': '1px solid #f3f3f3',
				'height':+ (this.options.height - 1) + 'px'
			}).appendTo(this.rightElement);

			// 2016.03.21添加iframe框架
			var pptElement_tem_height=$.browser.Quirks ? 288 : 120;
			this.pptElement         = $({tag: 'iframe', className: 'window-right-pro-images', style: $.STYLE_BODY + 'margin:0px;width:' + (this.options.rightElementWidth) + 'px;background:#fff;height:'+ pptElement_tem_height+'px;overflow-x:hidden; scroll-x:none'}).attr({
				'src': 'https://store.meizu.com/xn/index'
			}).appendTo(this.rightBody);

			//taglist ul
			this.buttonScrollTop    = $({tag:'div',className:'nTalk-scroll-top', style:$.STYLE_NBODY + 'height:20px;width:100%;z-index:99;background:url(' + $.imageicon + ') no-repeat 20px -92px;display:block;cursor:pointer;'}).appendTo(this.leftElement);
			this.leftBody           = $({tag:'div',className:'nTalk-scroll-body', style: $.STYLE_NBODY + 'overflow:hidden;height:424px;'}).appendTo(this.leftElement);
			this.leftContent        = $({tag:'ul',className: 'ntalke-scroll-content', style: $.STYLE_NBODY}).appendTo(this.leftBody);
			this.buttonScrollBottom = $({tag:'div',className:'nTalk-scroll-bottom', style:$.STYLE_NBODY + 'height:20px;width:100%;z-index:99;background:url(' + $.imageicon + ') no-repeat 20px -108px;display:block;cursor:pointer;'}).appendTo(this.leftElement);
		},
		_bind: function(){
			var self = this;

			this.buttonScrollTop.click(function(event){
				if( self._verificationScroll(true) ){
					self.leftBody.scrollTop( self.leftBody.scrollTop() - 40 );
				}
			}).hover(function(event){
				if( self._verificationScroll(true) ){
					$(this).css('background-position', '-79px -92px');
				}
			}, function(event){
				$(this).css('background-position', '20px -92px');
			});
			this.buttonScrollBottom.click(function(event){
				if( self._verificationScroll(false) ){
					self.leftBody.scrollTop( self.leftBody.scrollTop() + 40 );
				}
			}).hover(function(event){
				if( self._verificationScroll(false) ){
					$(this).css('background-position', '-79px -108px');
				}
			}, function(event){
				$(this).css('background-position', '20px -108px');
			});
		},
		/**
		 * 聊窗标签 _onOverChatTag
		 * @param  Event event
		 * @return {[type]}
		 */
		_onOverChatTag: function(event){
			var target = this;
			while( target.tagName.toUpperCase() !== 'LI' ){
				target = target.parentNode;
			}
			$(target).find('.tag-button-close').css({
				background: 'url('+$.imageicon+') no-repeat -140px -39px'
			});
			if( $(target).indexOfClass('talk_flicker') ) return;
			$(target).css({
				'border-top':		'1px solid #ccc',
				'border-bottom':	'1px solid #ccc',
				'border-left':		'1px solid #ccc',
				'left':				'1px',
				'background':		'#fff'
			});
		},
		/**
		 * 聊窗标签 _onOutChatTag
		 * @return {[type]}
		 */
		_onOutChatTag: function(){
			var target = this;
			while( target.tagName.toUpperCase() !== 'LI' ){
				target = target.parentNode;
			}
			$(target).find('.tag-button-close').css({
				background: 'none'
			});
			if( $(target).indexOfClass('talk_flicker') ) return;
			if( $(target).indexOfClass('talk_selected') ) return;
			$(target).css({
				'border-top':		'1px solid #fafafa',
				'border-bottom':	'1px solid #fafafa',
				'border-left':		'1px solid #fafafa',
				'left':				'0px',
				'background':		'#fafafa'
			});
		},
		/**
		 * 聊窗标签选中 _onSelectedChatTag
		 * @param  {[type]} tagChat
		 * @return {[type]}
		 */
		_onSelectedChatTag: function(tagChat){
			var self = this;
			$('li', this.leftContent).each(function(i, element){
				$(element).removeClass('talk_selected');
				//正在闪烁的标签，不执行此操作
				if( !$(element).indexOfClass('talk_flicker') ){
					self._onOutChatTag.apply( element );
				}
			});

			this.stopFlicker( $(tagChat).attr("key") );
			$(tagChat).addClass('talk_selected').css({
				'border-top':		'1px solid #ccc',
				'border-bottom':	'1px solid #ccc',
				'border-left':		'1px solid #ccc',
				'left':				'1px',
				'background':		'#fff'
			});
		},
		/**
		 * 窗体大小变化
		 * @param  {json} args
		 * @return {[type]}
		 */
		_callResize: function(args){
			var chatWidth = args.width;
			var chatHeight= args.height;

			if( this.extended.leftElement ){
				chatWidth -= this.options.leftElementWidth;
			}
			if( this.extended.rightElement ){
				chatWidth -= this.options.rightElementWidth;
			}
			this.options.width  = chatWidth;
			this.options.height = chatHeight - this.options.dropHeight;

			this.headBody.css('width', (args.width - 2) + 'px');

			this.body.css('width', ( this.options.width + (this.extended.leftElement ? this.options.leftElementWidth : 0) ) + 'px');
				this.leftElement.css({
					width: (this.options.leftElementWidth - 1) + "px",
					height:(this.options.height - 1) + "px"
				});
					this.leftBody.css('height', (this.options.height - 40) + 'px');
				this.chatContainter.css({
					width: (this.options.width - 2) + "px",
					height:(this.options.height - 1) + "px"
				});

			this.rightBody.css({
				height:(this.options.height - 1) + "px"
			});

			//侧边栏内容区高，去除侧边栏标签区高
			//var rigthConentHeight = this.options.height - Math.max(this.rightTags.height() + parseFloat(this.rightTags.css('border-top-width')) - 1, 28);
			//2016.03.21 更改高度值

			var rigthConentHeight = this.options.height - 151;
			//2016.03.21新添加
			//this.rightElement.css('height', 'auto');
			this.rightElement.find('.view-right-content').css({'height': rigthConentHeight + 'px'});
			this.rightElement.find('.window-right-content iframe').attr('height', rigthConentHeight).css({'height': rigthConentHeight + 'px'});//右侧iframe样式、属性同步更新

			//聊窗尺寸
			this._manageMode.callManageResize(this.options.width, this.options.height);
		},
		/**
		 * @method _callMaxResize 窗口大小变化时回调
		 * @return {void}
		 */
		_callMaxResize: function(){
			var setMax = this.options.height < this.defaultOptions.resizeHeight;
			this.chatHeight = this.options.dropHeight + (setMax ? this.defaultOptions.resizeHeight : this.defaultOptions.height);

			this._objView.changeAttr(this.chatWidth, this.chatHeight);

			if( setMax ){
				this._objView.buttonMax.attr('title', $.lang.chat_button_resize_min);
			}else{
				this._objView.buttonMax.attr('title', $.lang.chat_button_resize_max);
			}

			this._callResize({width: this.chatWidth, height: this.chatHeight});
		},
		/**
		 * 还原窗体
		 * @return {[type]}
		 */
		_callMaximize: function(){
		},
		/**
		 * 关闭窗体
		 * @return {[type]}
		 */
		_callClose: function(){
			this._manageMode.close();
		},
		/**
		 * 最小化窗体
		 * @return {[type]}
		 */
		_callMinimize: function(){
			this._manageMode.callMinimize();
		},
		/**
		 * 切换窗体
		 * @param  {HtmlDOM} elem
		 * @param  {Event}   event
		 * @return {[type]}
		 */
		_onSwitchChat: function(elem, event){
			var tagKey = $(elem).attr('key');
			$.Event.fixEvent(event).stopPropagation();

			this._onSelectedChatTag(elem);

			this._manageMode.callSwitchChat(tagKey);
		},
		/**
		 * 关闭单个窗体
		 * @return {[type]}
		 */
		_onCloseChatTag: function(elem, event){
			var tagKey, target = elem;

			$.Event.fixEvent(event).stopPropagation();

			while( target.tagName.toUpperCase() !== 'LI' ){
				target = target.parentNode;
			}
			$(target).removeClass('talk_selected');
			tagKey = target.className.replace(/^\s*|\s*$/g, '') || '';

			this._manageMode.closeChat(tagKey);
		},
		_getChatPosition: function(position){
			var offset, selector;
			if( !position || $.isEmptyObject(position) ){
				//默认定位
				this.options.left = Math.max(0, $(window).width()  - this.options.width);
				this.options.top  = Math.max(0, $(window).height() - this.options.height - this.options.dropHeight);
			}else if(position.rightline && position.width){
				//网页右边线定位
				this.options.left = Math.max(0, ($(window).width() - position.width)/2  + position.width - this.options.width);
				this.options.top  = Math.max(0, $(window).height() - this.options.height - this.options.dropHeight);
			}else if( (position.id || position.entryid) && $.isDefined(position.left) && $.isDefined(position.left) ){
				//相对于指定节点定位
				selector = position.id || position.entryid || '';
				selector = /(^[#\.])|\s+/gi.exec(selector) ? selector : '#'+selector;

				//2014.12.25 添加兼容：网站配置页面中找不到的节点时
				if( !$(selector).length ){
					this.options.left = Math.max(0, $(window).width()  - this.options.width);
					this.options.top  = Math.max(0, $(window).height() - this.options.height - this.options.dropHeight);
				}else{
					offset = $(selector).offset();
					position.left = position.left || 0;
					position.top  = position.top || 0;
					this.options.left = Math.min(offset.left - this.options.width + position.left, $(window).width()  - this.options.width);
					this.options.top  = Math.min(offset.top  + position.top, $(window).height() - this.options.height - this.options.dropHeight);
				}
			}else{
				//预设位置定位
				switch(position.position){
				case 'left-top':
					this.options.left = 0;
					this.options.top  = 0;
					break;
				case 'center-top':
					this.options.left = Math.max(0, ($(window).width() - this.options.width)/2);
					this.options.top  = 0;
					break;
				case 'right-top':
					this.options.left = Math.max(0, $(window).width()  - this.options.width);
					this.options.top  = 0;
					break;
				case 'left-center':
					this.options.left = 0;
					this.options.top  = Math.max(0, ($(window).height() - this.options.height - this.options.dropHeight)/2);
					break;
				case 'center-center':
					this.options.left = Math.max(0, ($(window).width() - this.options.width)/2);
					this.options.top  = Math.max(0, ($(window).height() - this.options.height - this.options.dropHeight)/2);
					break;
				case 'right-center':
					this.options.left = Math.max(0, $(window).width()  - this.options.width);
					this.options.top  = Math.max(0, ($(window).height() - this.options.height - this.options.dropHeight)/2);
					break;
				case 'left-bottom':
					this.options.left = 0;
					this.options.top  = Math.max(0, $(window).height() - this.options.height - this.options.dropHeight);
					break;
				case 'center-bottom':
					this.options.left = Math.max(0, ($(window).width() - this.options.width)/2);
					this.options.top  = Math.max(0, $(window).height() - this.options.height - this.options.dropHeight);
					break;
				default:// 'right-bottom'
					this.options.left = Math.max(0, $(window).width()  - this.options.width);
					this.options.top  = Math.max(0, $(window).height() - this.options.height - this.options.dropHeight);
					break;
				}

				this.options.left += (position.xoff || 0);
				this.options.top  += (position.yoff || 0);

				//2015.06.11 最大、最小限制
				this.options.left = Math.min(Math.max(this.options.left, 0), $(window).width()  - this.options.width);
				this.options.top  = Math.min(Math.max(this.options.top,  0), $(window).height() - this.options.height - this.options.dropHeight);
			}
		},
		/**
		 * 验证是否需要显示滚动条
		 * @param {boolean} isTop
		 */
		_verificationScroll: function(isTop){
			var tmp = this.leftBody.scrollHeight() - this.leftBody.height();
			if( isTop && tmp > 0 && self.leftBody.scrollTop() > 0 ){
				return true;
			}else if( !isTop && tmp > 0 && tmp > this.leftBody.scrollTop() ){
				return true;
			}else{
				return false;
			}
		},
		/**
		 * @method _addRightLabel   添加右侧标签、内容节点
		 * @param {string} title    标签文本
		 * @param {string} data     标签内容或URL
		 * @param {number} length   标签总数
		 * @param {boolean}selected 是否选中
		 * 修复标签设定选择项功能
		 * 2015.08.27 常见问题事件优化
		 */
		_addRightLabel: function(title, data, length, selected){
			var self = this,
				expURL = /^https?:\/\/(.*?)/gi,
				key = $.randomChar(), listElement, style, tagElement, tagBody,
				rightContentWidth  = this.options.rightElementWidth - 12 - length + 1,
				//2016.03.21更改高度
				rightContentHeight = this.options.height -314;
			if( !this.rightTags ){
				//2016.03.11更改颜色 border 改为1
				this.rightTags = $({className:'window-right-tags', style: $.STYLE_NBODY + 'background:#d5d5d5;z-index:1;overflow:hidden;height:29px;border-top:1px solid #FFF;position:absolute;top:120px;left:0px'}).appendTo(this.rightBody);
				this.rightTags.insert('<div style="' + $.STYLE_NBODY + 'clear:both;"></div>');
			}
			if( !this.rightContent){
				//2016.03.11
				this.rightContent = $({className:'window-right-content', style: $.STYLE_NBODY + 'overflow:hidden;background:#ffffff;width:'+(this.options.rightElementWidth -1) +'px;position:absolute;top:150px;left:0px;z-index:1;'}).appendTo(this.rightBody);
			}
			//2016.03.11改变字体border颜色
			style = $.STYLE_BODY + 'background-color:#FAF9F9;height:26px;color:#333333;line-height:26px;text-align:center;cursor:pointer;border:1px solid #ebedec;float:left;';

			if( length == 1 ){
				//2016.03.11
				style += 'width:199px;';
			}else{
				if( this.rightTags.find('div').length == 1 ){
					//2016.03.21更改width值 border值
					style += 'width:' + (length == 2 ? 98 : 64) + 'px;border-right:1px solid #ebedec;';
				}else if( this.rightTags.find('div').length < length ){
					style += 'width:' + (length == 2 ? 98 : 64) + 'px;border-right:1px solid #ebedec;';//border-left:1px solid #FCE4E7;
				}else{
					//2016.03.29 修改大小
					style += 'width:' + (length == 2 ? 97 : 65) + 'px;';//border-left:1px solid #FCE4E7;
				}
			}
			// if(title.indexOf('\u5173\u4E8E\u4F01\u4E1A') > -1) {
			// 	title = '\u5546\u54C1\u8BE6\u60C5';
			// }
			tagElement = $({className: key, title: title, style: style}).appendTo(this.rightTags, this.rightTags.find('div').last()).html( title );//.gradient("top", '#F8CEDC', '#FAB2CA')
			//2016.03.21更改颜色 增加padding 值width值
			tagBody = this.rightContent.insert( ['<div class="',key,' view-right-content" style="',$.STYLE_BODY,'background-color:#ffffff;width:'+ (this.options.rightElementWidth) +'px;height:' + rightContentHeight + 'px;overflow-x:hidden;;overflow-y:auto;display:none;"></div>'].join('') );

			if( $.isArray(data) ){
				//2016.03.11修改list样式和颜色值
				//用于常见问题一类的列表形式展示内容
				listElement = $({tag: 'ul', style: $.STYLE_BODY + 'margin:0px 0px 4px 0px;list-style:none;background-color:#ffffff;'}).appendTo(tagBody).click(function(event){
					var srcElement = $.Event.fixEvent(event).target;
					if( srcElement.tagName.toLowerCase() !== 'li' ) return;
					var title = $(srcElement).attr('talk_title');
					var content= $(srcElement).attr('talk_content');

					self._manageMode.showFAQ(self.settingid, title, content);
				});
				for(var i = 0; i < data.length; i++){

					//2016.03.11更改颜色
					$({className:'questionsList',tag:'li', talk_title: data[i].title, talk_content: data[i].con,  style: $.STYLE_BODY + 'list-style:none outside none;padding:5px 10px;padding-right:none;cursor:pointer;background-color:#ffffff;color:#666666'}).hover(function(event) {
							$.Event.fixEvent(event).stopPropagation();
							$(this).css({
								'list-style':'none outside none',
								'cursor':'pointer',
								'background-color':'#cccccc',
								'color':'#666666'
							})
						}, function(event){
							$.Event.fixEvent(event).stopPropagation();
							$(this).css({
								'list-style':'none outside none',
								'cursor':'pointer',
								'background-color':'#ffffff',
								'color':'#666666'
							})
						}).appendTo(listElement).html( $.clearHtml(data[i].title || '') );

					/*
					.html( '<span style="' + $.STYLE_BODY + 'color:#525252;background-color:#FAF9F9;text-decoration:none;">' + $.clearHtml(data[i].title || '') + '</span>' );
					*/
				}

			}
			else if( expURL.test( data ) ){
				//自定义签外部页面传入参数
				data += (data.indexOf('?')==-1 ? '?' : '&') + $.toURI({
					lan:		$.extParmas['lan'],
					sellerid:	this._manageMode.sellerid,
					userid:		$.user.id,
					exparams:	$.global.exparams || ''
				});
				$({className: 'window-right-iframe', tag: 'iframe', width:'100%',frameborder:'0', height:rightContentHeight, scrolling: 'auto', style:$.STYLE_NBODY + 'width:100%;height:' + rightContentHeight + 'px;'}).appendTo(tagBody.css('overflow-y','hidden')).attr('src', data);
			} else {//text3.30更改color 值
				$({className: 'window-right-text', style: $.STYLE_BODY + 'margin:5px;color:#666666;font-size:10px;'}).appendTo(tagBody).html(data);
			}
			//新创建标签默认选中
			if( selected ){
				this._selectedTag(tagElement);
			}

			return tagElement;
		},
		_bindTag: function(){
			var self = this;
			if( !this.rightTags ){
				return;
			}
			this.rightTags.find('[class]').click(function(){
				self._selectedTag(this);
			});
		},
		_selectedTag: function(eventElement){
			var self = this;
			this.rightTags.find('[class]').each(function(i, elem){
				var key = $.myString( elem.className.replace('talk_selected', '') ).trim();

				if( $(eventElement).indexOfClass( key ) ){
					//$.Log('selected class:' + key + ', selected');
					//2016.03.11改变背景颜色高度值
					$(elem).addClass('talk_selected').css({'height': '26px', 'border-bottom': '2px solid #01B8EF','background-color':'#ffffff','color':'#01B8EF'});//.gradient('top', '#F8BAC2', '#F9CDDC').css('color', '#DE7E80');
					self.rightContent.find('.'+key).display(1);
				}else{
					//$.Log('selected class:' + key + '');
					$(elem).removeClass('talk_selected').css({'height': '28px', 'border-bottom': '1px solid #f3f3f3','background-color':'#f3f3f3','color':'#333333'});//.gradient('top', '#F8CEDC', '#FAB2CA').css('color', '#FFFFFF');
					self.rightContent.find('.'+key).display();
				}
			});
		},
		_clearTag: function(){
			this.rightBody.find(".window-right-tags *,.window-right-content *").remove();
			this.rightTags = null;
			this.rightContent = null;
		}
	};

})(nTalk);

/* @file chat.js
 * @date 2018.08.30 10:29:24 
 */
!function(t,e){var i=/[\r\n]/gi,s=function(){};t.extend({default_connect_robot:!0}),t.Capture={udCapCtl:null,setupFrame:null,version:"1.6.1",mimeType:"application/xiaonengcapture-plugin",license:"C35F3907AADCC3BB0FEB1DAC6866D806A0DAA7C07A001D97E14ECFBE1D27CC99891F79A7D86AA9CCAFF6B24C1CC1BA89143E5F61849BCC87E12ED104A23B4F980EDCEBE5471FEDE121826153381CC7A3E040D9D5374D13A587BE7B4011FCA44C6E849C8717E483905FB038986FC7F8376E849C8717E483905FB038986FC7F837310A71452C349CA1EB060B439E6535037D30D63B4FEE80AB2C8102DFC48E0C486E849C8717E483905FB038986FC7F8376E849C8717E483905FB038986FC7F8376E849C8717E483905FB038986FC7F837",setup:"setup/Xiaonengcapture.msi",inited:!1,loaded:!1,callback:null,supportActiveX:!1,captureWithMin:!0,init:function(e){this.inited&&e||(this.inited=!0,t.Log("filetranserver:"+e),this.id="setFrame-"+t.randomChar(),this.name=this.id,this.PostUrl=e+"/imageupload.php?"+t.toURI({action:"uploadimage",siteid:t.global.siteid,roomid:"t2d",type:"json",charset:t.charset}),this.supportActiveX=void 0!==window.ActiveXObject,(this.supportActiveX&&"Win64"==window.navigator.platform||"x64"==window.navigator.cpuClass)&&(this.setup="setup/Xiaonengcapture64.msi"),this.loaded=!1,this.udCapCtlSpan=t({tag:"div",className:"nTalk-hidden-element",id:"udCapSpan",style:t.STYLE_NBODY+"left:-1000px;top:-1000px;"}).appendTo(!0),this.setupFrame=t({tag:"iframe",className:"nTalk-hidden-element",id:this.id,src:"",style:"display:none;"}).appendTo(!0))},start:function(e,i,n){t.Log("nTalk.Capture.start("+e+", "+i+", callback)");var a=this;this.settingid=e,this.callback=n||s;var o=navigator.userAgent.match(/Chrome\/([0-9]+)/);o&&o.length>=2&&o[1]>=42?alert(t.lang.capture_forbidden):t.Capture.installCheck()&&(this.captureWithMin&&t.chatManage.view.hidden(),setTimeout(function(){(a.supportActiveX||a.loaded)&&a.doCapture(i)},300))},doCapture:function(e){if(e&&this.udCapCtl.StartCapture)this.udCapCtl.StartCapture();else try{this.udCapCtl.Capture()}catch(e){this.udCapCtl&&this.udCapCtl.StartCapture?this.udCapCtl.StartCapture():(t.chatManage.view.visible(),alert(t.lang.capture_reload))}},hasVersion:function(t){"v"==t.substring(0,1)&&(t=t.substring(1,t.length));var e=this.version.split("."),i=t.split(".");return parseInt(e[0])>parseInt(i[0])||(parseInt(e[0])==parseInt(i[0])&&parseInt(e[1])>parseInt(i[1])||parseInt(e[0])==parseInt(i[0])&&parseInt(e[1])==parseInt(i[1])&&parseInt(e[2])>parseInt(i[2]))},addEvent:function(t,e,i){if(this.udCapCtl.attachEvent)this.udCapCtl.attachEvent(t,e);else{var s=e.name||e.toString().match(/^function\s?([^\s(]*)/)[1]||i,n=e.toString().substring(e.toString().indexOf("("),e.toString().indexOf(")")+1),a=document.createElement("script");a.setAttribute("for",this.udCapCtl.id),a.event=t+n,a.appendChild(document.createTextNode(s+n+";")),document.body.appendChild(a)}},_onBeforeCapture:function(){t.Log("Capture._onBeforeCapture",2)},_onCaptureCanceled:function(){t.Log("Capture._onCaptureCanceled"),t.chatManage.view.visible()},_onCaptureCompleted:function(e){t.Log("Capture._onCaptureCompleted("+e+")"),t.chatManage.view.visible()},_onBeforeUpload:function(e,i){t.Log("Capture._onBeforeUpload("+e+", "+i+")")},_onUploadCompleted:function(e){t.Log('Capture._onUploadCompleted("'+e+'")');var i,s=t.Capture,n=500;try{i=t.JSON.parseJSON(e)}catch(s){e=e.substring(e.indexOf("{"),e.indexOf("}")+1);try{i=t.JSON.parseJSON(e)}catch(t){return}}!1===s.callback.call()&&(n=0),s._callback("fIM_startSendFile",["","uploadimage",i.oldfile]),setTimeout(function(){s._callback("fIM_receiveUploadSuccess",["","uploadimage",i])},n)},_onUploadFailed:function(e){t.Log("Capture._onUploadFailed("+e+")",2)},_callback:function(e,i){i.push(this.settingid),t.hasOwnProperty(e)?t[e].apply(this,i):t.Log("nTalk."+e+"(...)",2)},installCheck:function(){if(this.loaded=!1,this.udCapCtl&&(this.loaded=!0),this.supportActiveX){if(t("#udCapSpan").html('<object id="udCaptureCtl" width="0" height="0" classid="CLSID:0FAE7655-7C34-4DEE-9620-CD7ED969B3F2"></object>'),this.udCapCtl=t("#udCaptureCtl").get(0),void 0===this.udCapCtl.PostUrl)return confirm(t.lang.capture_install)?(t("#udCapSpan").html(""),this.udCapCtl=null,this.startSetup()):(t("#udCapSpan").html(""),this.udCapCtl=null),!1;if(this.hasVersion(this.udCapCtl.GetVersion()))return confirm(t.lang.capture_activex_update)&&this.startSetup(),!1;this.udCapCtl.PostUrl=this.PostUrl,this.udCapCtl.License=this.license,this.addEvent("OnBeforeCapture",nTalk.Capture._onBeforeCapture,"nTalk.Capture._onBeforeCapture"),this.addEvent("OnCaptureCanceled",nTalk.Capture._onCaptureCanceled,"nTalk.Capture._onCaptureCanceled"),this.addEvent("OnCaptureCompleted",nTalk.Capture._onCaptureCompleted,"nTalk.Capture._onCaptureCompleted"),this.addEvent("OnBeforeUpload",nTalk.Capture._onBeforeUpload,"nTalk.Capture._onBeforeUpload"),this.addEvent("OnUploadCompleted",nTalk.Capture._onUploadCompleted,"nTalk.Capture._onUploadCompleted"),this.addEvent("OnUploadFailed",nTalk.Capture._onUploadFailed,"nTalk.Capture._onUploadFailed"),this.loaded=!0}else if(navigator.plugins){var e=navigator.mimeTypes&&navigator.mimeTypes[this.mimeType]?navigator.mimeTypes[this.mimeType].enabledPlugin:0;if(e){var i="v1.0.0",s=e.description.split(" ");if("v"==s[s.length-1].substring(0,1)&&(i=s[s.length-1]),this.hasVersion(i))return confirm(t.lang.capture_other_update)&&this.startSetup(),!1;t("#udCapSpan").html('<embed id="udCaptureCtl" width="0" height="0" type="'+this.mimeType+'"></embed>'),this.udCapCtl=t("#udCaptureCtl").get(0),this.udCapCtl.PostUrl=this.PostUrl,this.udCapCtl.License=this.license,this.udCapCtl.OnBeforeCapture="nTalk.Capture._onBeforeCapture",this.udCapCtl.OnCaptureCanceled="nTalk.Capture._onCaptureCanceled",this.udCapCtl.OnCaptureCompleted="nTalk.Capture._onCaptureCompleted",this.udCapCtl.OnBeforeUpload="nTalk.Capture._onBeforeUpload",this.udCapCtl.OnUploadCompleted="nTalk.Capture._onUploadCompleted",this.udCapCtl.OnUploadFailed="nTalk.Capture._onUploadFailed",this.loaded=!0}!this.loaded&&confirm(t.lang.capture_install)&&this.startSetup()}return this.loaded},startSetup:function(){this.setupFrame.attr("src",t.baseURI+this.setup)}},t.extend({CON_SINGLE_SESSION:"SINGLE",CON_MULTIPLAYER_SESSION:"MULTIPLAYER",imageicon:"",imagebg:"",imagesingle:"",imagemultiplayer:"",loadImageAbnormal:function(e,i){if("ntalk-enterprise-logo"==t(e).attr("data-type"))e.src=t.sourceURI+"images/blank.gif";else try{var s=t(e).parent().width(),n=t(e).parent().height();t(e).css({margin:"0px"}).attr({width:s,height:n,src:"1"==t(e).attr("data-single")?t.imagesingle:t.imagemultiplayer})}catch(e){t.Log("img parent is null",2)}},imgScrollBottom:function(){var e=nTalk.global.settingid;nTalk.chatManage.get(e)&&!/^guest/.test(t.global.shortid)&&t.flashserver.history_version&&2!=t.flashserver.history_version?nTalk.chatManage.get(e).view.scroll.scrollBottom():setTimeout(function(){/^guest/.test(t.global.shortid)&&t.flashserver.history_version&&2!=t.flashserver.history_version&&nTalk.chatManage.get(e)&&nTalk.chatManage.get(e).view.scroll.scrollBottom()},500)},zoom:function(e,i,s){var n,a,o={width:i,height:s};return e&&e.width?(n=e.width>i?i:e.width,(a=n/e.width*e.height)>s&&(n=(a=s)/e.height*e.width),t.extend(o,{width:n,height:a})):o},entityList:{"&":"&amp;","<":"&lt;","＜":"&lt;",">":"&gt;","＞":"&gt;","＆":"&amp;","©":"&copy;","®":"&reg;",'"':"&quot;","'":"&apos;","＂":"&quot;"},charFilter:function(e){var i,s,n=function(e){for(var i in t.entityList)"function"!=typeof t.entityList[i]&&(e=e.replace(new RegExp(""+i,"g"),t.entityList[i]));return e};if(t.isArray(e))for(i=[],s=0;s<e.length;s++)"object"==typeof e[s]?i[s]=t.charFilter(e[s]):"string"==typeof e[s]?i[s]=n(e[s]):i[s]=e[s];else if("object"==typeof e){i={};for(s in e)"function"!=typeof e[s]&&("object"==typeof e[s]?i[s]=t.charFilter(e[s]):"string"==typeof e[s]?i[s]=n(e[s]):i[s]=e[s])}else i=n(e);return i}}),t.chatConnect=t.Class.create(),t.chatConnect.prototype={name:"chatConnect",debug:!1,options:null,switchTimeId:null,error:!1,initialize:function(e,i){this.debug&&t.Log("create chatConnect()",1),this.options=t.extend({devicetype:t.browser.mobile?3:0,chattype:"0",chatvalue:"0"},t.whereGet(e,["requestRobot","siteid","settingid","tchatmqttserver","tchatgoserver","surl","cid","u","n","sid","groupid","rurl","statictis","htmlsid","connectid","userlevel","disconnecttime","mini","chattype","chatvalue","edu_invisitid","edu_visitid","usertag","userrank","leftchat","startType"],["requestRobot","siteid","settingid","tchatmqttserver","tchatgoserver","serverurl","machineID","userid","username","sessionid","destid","resourceurl","statictis","htmlsid","connectid","userlevel","disconnecttime","mini","chattype","chatvalue","edu_invisitid","edu_visitid","usertag","userrank"])),this.options.requestRobot&&t.Robot?(t.global.connect="robot",this._createRobotConnect()):(t.browser.supportMqtt||t.flash.support)&&this.options.tchatmqttserver&&1==t.server.tchatConnectType?(t.Log("mqtt connect."),t.global.connect="mqtt",this._createMqttConnect()):(t.Log("commet connect."),t.global.connect="comet",this.startCometConnect())},startCometConnect:function(){var e=this;t.require({TChat:"comet.chat.js"+t.baseExt},function(i){i?(t.Log("Loaded $comet.chat mode complete",3),e._createCometConnect()):t.Log("Loaded $comet.chat mode failed",3)})},sendMessage:function(e){var i=t.JSON.toJSONString(e);this.debug&&t.Log("chatConnect.sendMessage("+i+")"),this.connect&&t.isFunction(this.connect.sendMessage)?this.connect.sendMessage(i):t.Log("connect.sendMessage is undefined",3)},predictMessage:function(e){this.debug&&t.Log("chatConnect.predictMessage("+e+")"),this.connect&&t.isFunction(this.connect.predictMessage)&&this.connect.predictMessage(e)},setTextStyle:function(e){this.debug&&t.Log("chatConnect.setTextStyle("+t.JSON.toJSONString(e)+")"),this.connect&&t.isFunction(this.connect.setTextStyle)&&this.connect.setTextStyle(e)},disconnect:function(){if(this.debug&&t.Log("chatConnect.disconnect()"),this.connect&&t.isFunction(this.connect.closeTChat)){try{this.connect.closeTChat()}catch(t){}t.global.connect==t.CON_CONNECT_FLASH&&t.flash.remove(this.connect),this.connect=null}},closeTChat:function(){this.debug&&t.Log("chatConnect.closeTChat()"),this.disconnect()},switchConnect:function(){this.stopSwitchConnect(),t.Log("connect tchat abnormalities["+t.global.connect+"], switch the connection type.",2),this.options.requestRobot||"comet"==t.global.connect?(this.error=!0,t.Log("switch connect tchat type failure",3)):(this.connect&&t.isFunction(this.connect.remove)&&this.connect.remove(),this.connect&&t.isFunction(this.connect.disconnect)&&this.connect.disconnect(),t.global.connect=t.CON_CONNECT_COMET,this.startCometConnect())},stopSwitchConnect:function(){this.debug&&t.Log("chatConnect.stopSwitchConnect"),clearTimeout(this.switchTimeId),this.switchTimeId=null},_createCometConnect:function(){t.Log("chatConnect._createCometConnect()",1),this.connect=new t.TChat(this.options,t.server)},_createRobotConnect:function(){if(t.Log("chatConnect._createRobotConnect()",1),!t.Robot)return!1;this.connect=new t.Robot(this.options)},_createMqttConnect:function(){if(!t.Connection)return t.Log("load tchat connect object fail.",3),!1;this.connect=new t.Connection.TChat(this.options)}},t.chatMode=t.Class.create(),t.chatMode.prototype={name:"chatMode",debug:!1,view:null,options:null,manageMode:null,hash:new t.HASH,hashCache:new t.HASH,htmlsid:0,connectId:"",siteid:"",settingid:"",config:null,connected:!1,defData:null,_sendNum:0,_changeCsrNum:0,_changeCsrMaxNum:5,_reconnectCount:0,_startQueue:!1,_queueNum:1,statusConnectT2D:"WAIT",statusConnectTChat:"WAIT",_submitRating:!1,_Evaluable:!1,_Enableevaluation:!1,_currentView:"",inputMaxByte:0,selected:!1,floatTimeID:null,dest:null,hashDest:new t.HASH,sessionid:"",user:null,_moreData:null,unread:0,userNumber:0,userList:[],sessionType:null,enterData:null,captureing:!1,waitTimeID:null,cacheTimeID:null,server:[],passive:0,evaluateSign:null,receiveMsgCount:0,requestRobot:!1,enterUserId:null,startCSSwitch:"",CON_GENERAL:1,CON_ADPTER:1e4,CON_INVITE:10001,CON_VIEW_LOADING:"loading",CON_VIEW_ERROR:"error",CON_VIEW_WINDOW:"window",CON_VIEW_MESSAGE:"message",CON_OFFLINE:0,CON_ONLINE:1,CON_INVISIBLE:2,CON_BUSY:3,CON_AWAY:4,CON_LOGIN_FAILURE:0,CON_LOGIN_SUCCESS:1,CON_CONNECT_FAILURE:2,CON_CONNECT_SUCCESS:3,CON_DISCONNECT:4,CON_CLOSE_CONNECT:5,CON_MOBILE_SHOW_GOODSINFO:0,CON_ROBOT_ID:"_ISME9754_T2D_webbot",CON_ROBOT_ERROR_MESSAGE:"ROBOT_ERROR_MESSAGE",CON_ROBOT_NO_ANSWER:"非常对不起哦，这个问题在我知识范围外，我会努力去学习的！",robotID:"",robotSessionID:"",lastSessionID:"",t2dMode:null,uploadingid:{},evalRequestType:"POST",evalFailCount:0,startType:0,robotSystemMessage:{message:"留言",fq:"FQ,放弃排队",ch:"CH,查看排队情况"},initialize:function(e,i){this.defData={type:1,userid:"",name:"",logo:"",msg:""},this.sessionid="",this.dest={id:"",name:""},this._moreData=[],this.user={id:t.user.id},this.hash.clear(),this.options=t.extend({},e),this.manageMode=i,this.siteid=this.options.siteid,this.sellerid=this.options.sellerid,this.settingid=this.options.settingid,this.edu_invisitid=this.options.edu_invisitid,this.edu_visitid=this.options.edu_visitid,this.itemid=this.options.itemid,this.htmlsid=this.options.htmlsid,this.connectId=this.options.connectid,this.selected=!0,this.unread=0,this._submitRating=!1,this._Evaluable=!1,this._currentView=this.CON_VIEW_LOADING,this.robotID=this.siteid+this.CON_ROBOT_ID,this._callbackGoodsinfo="scriptCallReceiveGoodsinfo_"+this.settingid,window[this._callbackGoodsinfo]=null,this._callbackHistoryMessage="scriptCallHistoryMessageList_"+this.settingid,window[this._callbackHistoryMessage]=null,this.historyMessagePage=1,this.historyMessagePageStatus=1,this.historyEndTime=(new Date).getTime().toString().slice(0,10),this.requestTimeout=null,this.defStyle={bold:!1,color:"000000",fontsize:"14",underline:!1},this.waitTimeID=[],this.cacheTimeID=[];var s=this,n=t.ntView?t.ntView.chatView:t.chatView;this.view=new n({siteid:this.siteid,settingid:this.settingid,width:this.manageMode.view.options.width,height:this.manageMode.view.options.height,chatHeader:this.manageMode.view.header,chatContainter:this.manageMode.view.chatContainter,toggleExpansion:function(t){s.toggleExpansion(t)}},this);var a=t.ntView?t.ntView.eduWapAutoView:t.eduWapAutoView;t.isAutoEdu&&t.browser.mobile&&(this.eduWapAutoView=new a(this.settingid)),this.setDest(),this.inputMaxByte=600,this.initConfig(),t.browser.mobile||t.Capture.init(this.server.filetranserver),this.view.disableButton(["history","evaluate","capture"],!0),this.view.createFileButton(this.server),this.supMediaMessage(),this.callStat("24")},toggleExpansion:function(t){return this.manageMode.callToggleExpansion(t)},getExpansionStatus:function(){return this.manageMode.view.extended.rightElement},loadLink:function(e,i){var s,n,a=this,o=t.isDefined(this.server.queryurl)&&this.server.queryurl?this.server.queryurl:"";!o||!e||!/^\d+\.\d+\.\d+\.\d+$/gi.test(t.domain)&&e.indexOf(t.domain)<=-1&&t.global.pageinchat||(t.Log("nTalk.chatMode.loadLink("+e+")"),s="callback_"+t.randomChar(),n=t.toURI({query:"getwebinfo",weburl:e,ctype:1,siteid:this.siteid,batch:0,callbackname:s}),window[s]=function(e){if(t.Log("nTalk.chatMode.loadLink() callback: "+t.JSON.toJSONString(e),1),e.customer="",a.view.viewLinkContainer&&e.title){if(e.customs&&e.customs.length>0)for(var s=0;s<e.customs.length;s++)e.customs[s]&&e.customs[s].name&&e.customs[s].content&&(e.customer+=e.customs[s].name+e.customs[s].content+"<br/>");a.view.viewLinkContainer(e,i)}},t.require(o+"?"+n+"#rnd"))},callTrack:function(e,i){var s={siteid:this.siteid,userid:t.user.id,sid:this.getHtmlSid(),nodeid:e,nodeparam:i};{if(this.server.trackserver)return t.require(this.server.trackserver+"/track.php?"+t.toURI(s)+"#rnd#image",function(i){!0===i.error&&t.Log("call trackServer error: "+e,3),t(i.error?i.target:i).remove()}),!0;t.Log("nTalk.chatMode.callTrack("+e+"): trackserver error",1)}},callStat:function(e){var i=new RegExp("^(1|2|4|5|6|7|8|18|19|20|21)","gi"),s=new RegExp("^(0|5|14|15|16|17|10|11|12|13|22|23|24)$","gi"),n={type:"chatjs",siteid:this.siteid,kfid:this.dest.id||"",guestid:t.user.id,action:e,htmlsid:this.getHtmlSid(),chatsession:this.sessionid||"",settingid:this.settingid,userrank:this.options.userrank,usertag:this.options.usertag};if(!t.global.statictis&&i.test(e))return!1;if(2===t.global.statictis&&!s.test(e))return!1;this.debug&&t.Log(this.settingid+":chat.callStat("+e+")");var a;return"kf_9740"===this.siteid?(n=t.extend(n,{c:"addmessage",m:"collection"}),a="http://bkpi-sunlands.ntalker.com/index.php?"):(n=t.extend(n,{m:"Count",a:"collection"}),a=this.server.mcenter+"statistic.php?"),t.require(a+t.toURI(n)+"#rnd",function(i){!0===i.error&&t.Log("call statictis error: "+e,3),t(i.error?i.target:i).remove()}),!0},close:function(){this.statusConnectTChat="CLOSECHAT",this.disconnect(),!t.xpush||!t.browser.oldmsie&&t.browser.supportMqtt||t.xpush.startXpush(),this.userList=[],this.sessionid="",this.view.close(),this.callStat("23"),2==this.server.isnoim&&"1"==t.cache.get("opd")&&t.base&&t.base.startIM()},start:function(e){var i,s;if(this.config&&!t.isEmptyObject(this.config)){if(t.Log(this.settingid+":chatMode.start()"),t.isFunction(this.manageMode.callVerification)&&(i=this.manageMode.callVerification(this.settingid,this.config)))return i.showMessage("system0",{type:9,msg:t.utils.handleLinks(t.lang.system_merge_session,{destname:i.dest.name})}),i.send(e),t.chatManage.switchChatTag(i.settingid),void t.Log("Only one customer to open a chat window",2);this.dest.kfid=this.getDest(!0),(!1===(s=t.base.checkID(this.options.destid))||s!=t.CON_CUSTOMER_ID&&s!=t.CON_GROUP_ID)&&(this.options.destid=this.getDest(!0)),this.options.single||(t.base.checkID(this.options.destid)==t.CON_GROUP_ID?this.options.single=0:this.options.single=1),this.callStat("8"),this.getCustomerServiceInfo(this.options.destid,this.options.single)}else t.Log("chatMode.start():config is null",3)},reconnect:function(e,i,s,n,a){if(e){for(;e&&"LI"!=e.tagName.toUpperCase()&&e.parentNode;)e=e.parentNode;t(e).remove()}/QUERY|QUEUE/i.test(this.statusConnectT2D)?t.Log("reconnect:"+this.statusConnectT2D):/QUEUE|READY|COMPLETE/i.test(this.statusConnectTChat)?t.Log("reconnect:"+this.statusConnectTChat):(i&&(this.options.destid=i||"",this.options.single=s||"0",this.options.edu_invisitid=n||"",this.options.edu_visitid=a||""),this._currentView!==this.CON_VIEW_WINDOW&&this.switchUI(this.CON_VIEW_WINDOW),this.start())},createConnect:function(){var e,i=this,s=1===this.t2dMode?this.lastSessionID:this.sessionid;t.Log("connect tchat sessioId>>"+this.sessionid,1),e={tchatgoserver:this.server.tchatgoserver,tchatmqttserver:this.server.tchatmqttserver,siteid:this.siteid,settingid:this.settingid,surl:this.server.flashserver,rurl:t.baseURI,u:t.user.id,n:t.user.name,groupid:this.dest.id,destname:this.dest.name,sid:s,cid:t.global.pcid,htmlsid:this.getHtmlSid(),connectid:this.connectId,statictis:t.global.statictis,userlevel:t.global.isvip||"0",disconnecttime:this.config.contime||180,mini:0,chattype:t.global.chattype||"1",chatvalue:3==t.global.chattype?t.global.inviteid:t.global.chatvalue||"0",loadnid:t.CON_LOAD_MODE_NID,requestRobot:this.requestRobot,edu_invisitid:t.chatManage.get(this.settingid).options.edu_invisitid,edu_visitid:t.chatManage.get(this.settingid).options.edu_visitid,userrank:this.options.userrank,usertag:this.options.usertag,leftchat:this.options.config.leftchat,startType:this.startType},this.callTrack("10-01-01","start connect"),this.connect&&(this.statusConnectTChat="WAIT",this.statusConnectT2D="WAIT",this.disconnect()),this.connect=new t.chatConnect(e,this.server.close_tchat_flash||"0"),this.requestRobot&&setTimeout(function(){i.connect.error&&(clearTimeout(this._connectTimeout),i.switchUI(i.CON_VIEW_MESSAGE,"TIMEOUT"))},6e3),this._connectTimeout=setTimeout(function(){i.callTrack("10-01-03","connect time out"),i.debug&&t.Log("connect timeout 60s"),i.switchUI(i.CON_VIEW_MESSAGE,"TIMEOUT")},6e4)},supMediaMessage:function(){var e=this;t.listenerMessage(function(i){switch(i.method){case"OpenWebUrl":"function"==typeof window.openURLToBrowser?window.openURLToBrowser(i.url):window.open(i.url);break;case"OpenDialog":window.openURLToBrowser,alert(i.msg);break;case"OpenNTalkerPage":e.switchUI(e.CON_VIEW_MESSAGE);break;case"SendMessage":switch(i.msg[0]){case"0":e.send(i.msg[2]);break;case"1":chat.showMessage("left",{type:1,msg:t.utils.handleLinks(i.msg[2],{destname:chat.dest.name})});break;case"2":var s=t.getTime(),n={localtime:s,timerkeyid:s,msgid:e.getMsgId(s)},a=t.extend({},e.defData,n,{msg:i.msg[2].replace(/</gi,"&lt;").replace(/>/gi,"&gt;")});e.connect.sendMessage(a);break;default:t.Log("postMessage is no")}case"Openkeyboard":case"Closekeyboard":break;case"windowHeight":t("#"+i.msg.uri)&&(t.browser.mobile?(i.msg.widthSe&&(document.getElementById(i.msg.uri+"").style.width=i.msg.widthSe+"px"),document.getElementById(i.msg.uri+"").style.height=i.msg.heightSe+"px",document.getElementById(i.msg.uri+"").setAttribute("scrolling","no")):(i.msg.widthSe&&(document.getElementById(i.msg.uri+"").style.width=i.msg.widthSe+"px"),i.msg.heightSe&&(document.getElementById(i.msg.uri+"").style.height=i.msg.heightSe+"px",document.getElementById(i.msg.uri+"").setAttribute("scrolling","no"))))}})},getHtmlSid:function(){return this.htmlsid?(this.htmlsid=t.getTime()-this.htmlsid.substring(0,this.htmlsid.length-3)>144e5?t.getTime(2):this.htmlsid,this.htmlsid):""},disconnect:function(){var e=this;"CLOSECHAT"==this.statusConnectTChat?(this.showMessage("system",{type:9,msg:t.utils.handleLinks(t.lang.system_end_session,{settingid:this.settingid})}),t.base.fire("SessionEnd",[{type:1,settingid:this.settingid||"",sessionid:this.sessionid||""}])):"COMPLETE"==this.statusConnectTChat?(0!==this.config.enable_auto_disconnect&&this.showMessage("system",{type:9,msg:t.utils.handleLinks(t.lang.system_auto_disconnect,{settingid:this.settingid})}),t.base.fire("SessionEnd",[{type:2,settingid:this.settingid||"",sessionid:this.sessionid||""}])):"WAIT"==this.statusConnectTchat&&this._clearChangeCsrNum(),this._stopConnectTimeout(),this.view.disableButton(["evaluate","capture"],!0),this.manageMode.view.updateViewStatus(!0),t.Log(e.settingid+":chatMode.disconnect()",1),this.connected=!1,this.statusConnectTChat="DISCONNECT",this.setDest({status:0}),this.chatFlashGoUrl&&t.require(this.chatFlashGoUrl+"#rnd",function(i){e.chatFlashGoUrl="",t(i.error?i.target:i).remove()}),this._queueTimeID&&(clearTimeout(this._queueTimeID),this._queueTimeID=null),t.each(this.waitTimeID,function(t,e){clearTimeout(e)}),this.waitTimeID=[],t.each(this.cacheTimeID,function(t,e){clearTimeout(e)}),this.cacheTimeID=[],this.connect&&this.connect.disconnect()},endSession:function(){var e=this;if(this.manageMode.hash.count()>1)if(t.Log("...............close",2),this.config&&1==this.config.enableevaluation&&!this._submitRating&&this._Evaluable&&this._currentView==this.CON_VIEW_WINDOW){if(!1===this.showEvaluation(1,"",function(){e.manageMode.closeChat(e.settingid)}))try{e.manageMode.closeChat(e.settingid)}catch(e){t.Log(e,3)}}else this.manageMode.closeChat(this.settingid);else this.manageMode.close()},switchUI:function(e,i){this.view.switchUI(e),this._currentView=e,t.Log(this.settingid+":chatMode.switchUI("+e+", "+i+")"),e===this.CON_VIEW_MESSAGE&&(this.callTrack("10-01-08"),this.manageMode.view&&t.isFunction(this.manageMode.view.updateViewStatus)&&this.manageMode.view.updateViewStatus(!0),this.disconnect(),this.callStat("22"),this.createMessageForm())},createMessageForm:function(){var e;this.config.form_message&&"string"!=typeof this.config.form_message&&this.config.form_message.length||(this.config.form_message=this.config.message_form),this.config.form_message&&"string"!=typeof this.config.form_message&&this.config.form_message.length&&!this.config.preferlan||(this.config.form_message=t.lang.default_message_form_fields||""),this.dest=this.getDest(!1),this.setDest({status:0}),e={myuid:t.user.id,destid:this.dest.id,sid:this.sessionid||"",source:"",content:""},this.hashCache.each(function(t,i){1==i.type?e.content+=i.msg+"\n":/^(2|4)$/.test(i.type)&&(e.fileError=!0)}),this.hashCache.clear(),this.view.createMessageForm(this.config.form_message,this.config.disable_message,this.config.form_announcement||this.config.announcement||"",e)},submitMessageForm:function(){var e,i={t:"leaveMsg",siteid:this.siteid,sellerid:this.sellerid,settingid:this.settingid};"kf_9740"===this.siteid?(i=t.extend(i,{c:"addmessage",m:"queryService"}),e="http://bkpi-sunlands.ntalker.com/index.php?"):(i=t.extend(i,{m:"Index",a:"queryService"}),e=this.server.mcenter+"queryservice.php?"),1==t.global.message&&(i=t.extend(i,{opId:t.global.opId}));var s=t(".chat-view-message-form input[name=msg_email]"),n=s.val().replace(/(^\s*)|(\s*$)/g,"");s.val(n),this.view.submitMessageForm(this.config.form_message,e+t.toURI(i)+"#rnd")},_stopConnectTimeout:function(){clearTimeout(this._connectTimeout),this._connectTimeout=null},cancelUpload:function(e){var i="uploadfile"==e?"objFile":"objImage";t.Log(this.settingid+":chatMode.cancelUpload()"),this.view[i].cancelUpload&&this.view[i].cancelUpload(),this.view.updateMessage(this.uploadmsgid,"uploadfile"==e?4:2,-1)},_uploadReady:function(e){var i="uploadfile"==e?"objFile":"objImage";t.Log(this.settingid+":chatMode._uploadReady("+i+")",1),t.isFunction(this.view[i].setUploadServer)&&this.view[i].setUploadServer(this.server.filetranserver)},startUpload:function(e,i){var s=t.hexToDec(i||"").replace(/.*?(\u201c|\\u201c)/gi,"").replace(/(\u201d|\\u201d).*?$/gi,"");this.uploadmsgid=this.showMessage("right",{type:"uploadfile"==e?4:2,status:"UPLOADING",oldfile:t.browser.mobile?"":s})},startCompress:function(t){this.uploadmsgid=this.showMessage("right",{type:"uploadfile"==t?4:2,status:"COMPRESS"})},uploadSuccess:function(e,i){i=t.isObject(i)?i:t.JSON.parseJSON(i),i=t.protocolFilter(i),this.view.updateMessage(this.uploadmsgid,"uploadfile"==e?4:2,i),t.Log(this.settingid+": $.chatMode.uploadSuccess()",1),this.send(t.extend(i,{msg:i})),this.uploadmsgid=""},uploadFailure:function(e,i){if(!this.uploadmsgid){this.uploadmsgid=this.showMessage("right",{type:"uploadfile"==e?4:2,oldfile:(t.browser.mobile,""),name:i.name,size:i.size})}this.view.updateMessage(this.uploadmsgid,"uploadfile"==e?4:2,-2,i),this.uploadmsgid=""},uploadProgress:function(t,e){this.view.updateMessage(this.uploadmsgid,"uploadfile"==t?4:2,e)},showEvaluation:function(e,i,s){if(0==e&&this.view.evalDialog)return!1;if("WAIT"==this.statusConnectTChat&&0!=e)return!1;if(this.passive=e,i&&(this.evaluateSign=i),!0===this._submitRating&&0!=e)return!1;if(2==this.config.evaluateVersion)try{var n=t.JSON.parseJSON(this.config.newevaluate);return this.showEvaluationVersion2(n,s),!0}catch(e){t.Log("This newevaluate JSON is wrong, change evaluate to version 1.0"),this.config.evaluateVersion=1}this.manageMode.callReceive(this.settingid);this.config.form_evaluation&&"string"!=typeof this.config.form_evaluation&&this.config.form_evaluation.length||(this.config.form_evaluation=this.config.evaluation_form),this.config.form_evaluation&&"string"!=typeof this.config.form_evaluation&&this.config.form_evaluation.length&&!this.config.preferlan||(this.config.form_evaluation=t.lang.default_evaluation_form_fields||[]),this.config.evaluation_form_title||(this.config.evaluation_form_title=t.lang.default_evaluation_form_title||"");for(var a=0;a<this.config.form_evaluation.length;a++)this.config.form_evaluation[a]=t.extend(this.config.form_evaluation[a],{titlewidth:/zh_cn|en_us/gi.test(t.lang.language)?"5px":"10px",inputwidth:"auto",optionLine:!0,messageid:"alert-form-"+this.config.form_evaluation[a].name}),"textarea"==this.config.form_evaluation[a].type&&(this.config.form_evaluation[a]=t.extend(this.config.form_evaluation[a],{input:{width:"95%",height:"70px"}}));return this.evaluationElement=this.view.createEvaluation(this.config.form_evaluation,this.config.evaluation_form_title,this.config.startColor,this.config.endColor,s),!0},showEvaluationVersion2:function(e,i){var s=this;t.require({evaluateTree:s.config.evaluateFile+t.baseExt},function(){if(t.evaluateTree||(t.evaluateTree=new t.EvaluateTree(e)),s.config.enable_labelCounts){t.evaluateTree.clearAnswerCount();var n=t.evaluateTree.levelNodes[3],a="";for(nodeIndex in n)a+=n[nodeIndex].substring(1)+",";labeids=a.substring(0,a.lastIndexOf(","));window.labelCounts=function(e){try{var i="string"==typeof e?t.JSON.parseJSON(e):e;for(eid in i)t.evaluateTree.getNode("a"+eid).count=i[eid]}catch(e){t.Log("labelCounts.callback:"+e.message,3)}},e={kfid:s.dest.id,labids:labeids,callback:"labelCounts"},t.require(t.server.settingserver+"/index.php/api/setting/returnLabids?"+t.toURI(e)+"#rnd",function(){s.evaluationElement=s.view.createEvaluationVersion2(t.evaluateTree,i)})}else s.evaluationElement=s.view.createEvaluationVersion2(t.evaluateTree,i)})},getNewMessageConfig:function(){return this.config.new_leave_message||(this.config.new_leave_message={}),this.config.new_leave_message.disable_message=this.config.disable_message,this.config.new_leave_message},submitEvaluationForm:function(e,i){var s=this;if(2!=this.config.evaluateVersion)t.FORM.verificationForm(this.config.form_evaluation,function(t){if(s.evaluateSign&&0==s.passive){i={name:"evalute_start",title:"评价方式",value:{value:"0",text:s.passive+"_"+s.evaluateSign}};t.push(i)}else{var i={name:"evalute_start",title:"评价方式",value:{value:"0",text:s.passive+"_"}};t.push(i)}s.postEvaluate(t),e&&setTimeout(function(){e.call(s)},500)},this.evaluationElement,i);else{var n=t.EvaluateVerificate.getEvaluateSubmitData();if(t.isArray(n)){if(s.evaluateSign&&0==s.passive){a={id:"6",question:"评价发起的方式evalute_start",answer:[{labid:"-2",lab:s.passive+"_"+s.evaluateSign,score:"0"}]};n.push(a)}else{var a={id:"6",question:"评价发起的方式evalute_start",answer:[{labid:"-2",lab:s.passive+"_",score:"0"}]};n.push(a)}s.postEvaluate(n),e&&setTimeout(function(){e.call(s)},500)}else i.call(s,n)}},postEvaluate:function(e){try{e[2]&&"proposal"==e[2].name&&(e[2].value=nTalk.filterXSS(e[2].value))}catch(t){}var i=this;this.evaluationHidden=!0,e=this._formatEvaluationData(e),this.chatgourl||(t.Log("chatMode.postEvaluate():chatgourl:"+this.chatgourl,3),this.chatgourl=this.mdyServerAddr(this.server.tchatgoserver)),this.manageMode.addHistoryPageCount();var s=function(){t.Log("evaluate submit complete.",1),t.browser.mobile?evMsg=t.lang.system_mobile_evaluation:evMsg=t.utils.handleLinks(t.lang.system_evaluation,{evaluation:t.enCut(e.info,120)}),i.showMessage("info",{type:9,msg:evMsg})},n=function(){i.evalFailCount++,i.evalFailCount<3?h():(i.evalFailCount=0,t.Log("evaluate submit complete.",1),i.showMessage("info",{type:9,msg:"评价失败"}))},a=[function(e){"AJAX"===i.evalRequestType&&e&&e.status||"POST"===i.evalRequestType?(s(),i.evalFailCount=0):(t.Log(e.errormsg),n())},function(){t.Log("evaluate submit error.",1),n()}],o={action:"onremark",myuid:this.user.id,clientid:this.clientid,sessionid:this.sessionid,rnd:t.getTime(1)},r={url:t.server.tstatus,dataType:"json",crossDomain:!0,data:t.extend({},o,e.data,{type:0}),success:function(t){funcArr[0](t)},error:function(e){t.Log(e),i.evalRequestType="POST",h()}},h=function(){"AJAX"===i.evalRequestType?t.doAjaxRequest(r):new t.POST(i.chatgourl+"?"+t.toURI(o),e.data,a)};h()},download:function(){if(t.Log("download recording file"),"WAIT"!=this.statusConnectTChat){var e=t.toURI({m:"Msg",a:"downloadMsg",uid:this.user.id,sid:this.sessionid,lang:t.language,tzo:(new Date).getTimezoneOffset()/60,ts:t.getTime()}),i=this.server.mcenter+"historymessage.php?"+e;"function"==typeof window.openURLToBrowser?window.openURLToBrowser(i):this.view.displayiFrame.attr("src",i)}},viewHistory:function(e,i){var s=("gy_1000"===t.global.siteid?"http://bkpirb.ntalker.com/index.php/messageweb/webAppIndex?":this.server.mcenter)+"index.php/messageweb/webAppIndex?"+t.toURI({userid:this.user.id,lang:t.language,tzo:(new Date).getTimezoneOffset()/60,ts:t.getTime()});t.Log("view chats,iFrame:"+i+", url:"+s,2),t(i).attr("src",s)},startCapture:function(){var e=this;this.connected&&!0!==this.captureing&&(this.captureing=!0,t.Log(this.settingid+":chatMode.startCapture()"),t.Capture.start(this.settingid,!1,function(){e.captureing=!1,t.Log("Capture.onUploadCompleted()")}),setTimeout(function(){e.captureing=!1},500))},switchServerType:function(e,i){e?(t.Log("switch connect t2dstatus"),1==t.server.robot?(this.robotSessionID=this.sessionid,this.requestRobot=!1,this.view.disableButton("manual",!0),this.statusConnectTChat="CLOSECHAT",this.disconnect(),this.view.switchToolbar(!0),this.sendFirstMessage(),this.reconnect()):2==t.server.robot&&this.manualServiceInfo()):(t.Log("switch connect robot"),1==t.server.robot?(this.robotSessionID="",this.requestRobot=!0):2==t.server.robot&&(this.lastSessionID="",this.t2dMode=2===i?i:1),this.view.disableButton("manual",!1),this._stopQueue(),this.callMethod[this.callBack]=s,this.statusConnectT2D="COMPLETE",this.statusConnectTChat="WAIT",this.disconnect(),this.view.switchToolbar(!1),this.sendFirstMessage(),this.reconnect())},minimize:function(){this.selected=!1,this.view.minimize()},maximize:function(){t.Log(this.settingid+":chatMode.maximize()"),this.selected=!0,this.unread=0,this.view.maximize(),this.setDest()},receive:function(e){this._connectTimeout&&this._stopConnectTimeout();var i,s=this.checkHistoryVersion();t.isObject(e)?t.Log(this.settingid+":chatMode.receive("+t.JSON.toJSONString(e)+")"):(t.Log(this.settingid+":chatMode.receive("+e+")"),e=t.JSON.parseJSON(e)),2==s&&1==+e.history||(e=this._filterReceive(e),t.clearHtml(e.msg)!=this.CON_ROBOT_NO_ANSWER&&e.msg!=this.CON_ROBOT_ERROR_MESSAGE||(e.msg=this.config.robot_noanswer||e.msg),this.hash.contains(e.msgid)||1==e.history&&e.systype&&2!=e.history||(this.noticeMessageCountNew(),!1!==e&&(i=t.base.checkID(e.userid)==t.CON_CUSTOMER_ID?"left":"right",2==s&&e.speak_type&&(i=0==e.speak_type?"right":"left"),this.showMessage(i,e)),t.base.checkID(e.userid)==t.CON_CUSTOMER_ID&&this.addDestList({id:e.userid||"",name:e.name||e.nickname||e.username,logo:e.logo||""})))},suggest:function(t){return this.view.suggest(t)},robot2GetSuggest:function(e){if(!e||e&&(t.enLength(e)>25||e.length<2))t(".chat-view-hidden-area .chat-view-suggest-list").display();else{var i=this;window.__robot2_callback=function(e){try{e="string"==typeof e?t.JSON.parseJSON(e):e}catch(e){t.Log("Robot.callback:"+e.message,3)}e.list&&e.list.length>10&&(e.list=e.list.slice(0,10)),e.list=e.list.reverse(),i.robot2Suggest(e)},data={action:"ig",q:e,sessionid:this.sessionid,clientid:t.global.pcid,type:"jsonp",callbackname:"__robot2_callback"},t.require(this.server.robotserver+"/robot/app?"+t.toURI(data)+"#rnd")}},robot2Suggest:function(e){var i=[];if(e&&e.list&&0===e.status)return t.each(e.list,function(t,e){i.push(e.question)}),this.view.suggest(i,"robot2.0")},requestHistoryMessage:function(){if(!/^guest/.test(t.global.shortid)){var e,i=this;if(2==this.checkHistoryVersion()&&this.historyMessagePageStatus){if(this.historyMessagePage>10)return this.dontHaveHistoryMessage(),void t.Log("you can see ten pages message Only ");if(this.historyMessagePageStatus=0,1!=i.historyMessagePage&&t(".ntalker-historymessage-status").css({display:"block"}).html(t.lang.history.loading),!t.flashserver.apiserver)return void i.errorHistoryMessage();var n=(new Date).getTime().toString().slice(0,10),a=this.sellerid?this.sellerid:this.siteid,o=a+"_ISME9754_"+t.global.shortid+n,r=t.MD5(o);e=t.protocolFilter(t.flashserver.apiserver)+"/history/api_request_new.php?"+t.toURI({site_id:a,user_id:t.global.shortid,page:1,per_page:20,times:n,end_time:this.historyEndTime,token:r}),window[this._callbackHistoryMessage]=function(e){try{if(0==e.length)i.dontHaveHistoryMessage();else{if(0==e[0].error)return void i.dontHaveHistoryMessage();i.historyMessagePage++,i.showHistoryMessage(e),i.historyMessagePageStatus=1,i.view.iSmousewheel=!0}}catch(e){i.errorHistoryMessage(),t.Log("some error happen in historymessage"+e.message)}},t.require(e+"&callback="+this._callbackHistoryMessage+"#rnd",function(e){e.error&&(window[this._callbackHistoryMessage]=s,1!=i.historyMessagePage&&setTimeout(function(){t(".ntalker-historymessage-status").css({display:"block"}).html(t.lang.history.fail_to_load)},5e3)),t.Log("request the historymessage success")})}else t.Log("requesting data now please hold a minutes")}},clearRequestTimeout:function(){},dontHaveHistoryMessage:function(){t(".ntalker-historymessage-status").html(t.lang.history.nomore_data)},showHistoryMessage:function(e){var i=this;t.each(e,function(e,s){var n=s.msg_type,a=null,o=null,r=new Date(s.time.replace(/\-/g,"/")).getTime(),h=s.message;try{h=nTalk.filterXSS(h)}catch(t){}if(5!=n){switch(a={timestamp:r,sessionid:s.session_id,settingid:s.setting_id,speak_type:s.speaker_type,name:s.speaker_name,userid:s.speaker_id,logo:s.avatar,history:2,type:s.msg_type,msgid:s.msg_id},i.historyEndTime=r.toString().slice(0,10),n){case"2":var c=h.substring(h.indexOf('src="')+5,h.lastIndexOf('">'));o=c.indexOf("emoticon")>-1?{emotion:"1",url:c,sourceurl:c.replace(/32/,"50")}:c.indexOf("_thumb")>-1?{url:c,sourceurl:s.sourceurl||c.replace(/_thumb/,""),size:h.substr(h.indexOf("size:")+5)}:{url:c.replace(/&amp;/gi,"&"),sourceurl:s.sourceurl||c.replace(/image2/,"download2").replace(/&amp;/gi,"&"),size:h.substr(h.indexOf("size:")+5)};break;case"4":var l=h.substring(h.indexOf("filename")+9,h.indexOf("size"));emotion=l.substring(l.lastIndexOf(".")+1),o={url:h.substring(h.indexOf("url:")+4,h.indexOf("filename")).replace(/&amp;/gi,"&"),oldfile:l,size:h.substring(h.indexOf("size:")+5)};break;case"6":o={url:h.substring(h.indexOf("mp3:")+4,h.indexOf(" length:")),length:h.substring(h.indexOf("length:")+7)};break;case"7":var u=h.substring(h.indexOf("richmessage:")+12);if(h=nTalk.base64.decode(u),(d=new RegExp(/\[[0-9]*\].+[\n]/g)).test(h)){m=(h=h.replace("&amp;lt;![CDATA[","").replace("<![CDATA[","").replace("]]>","")).match(d);if(h=h.replace(/&amp;/gi,"&"),h=h.replace(/[\n]/gi,""),h=h.replace(/</g,"&lt;"),h=h.replace(/>/g,"&gt;"),m&&m.length>0)for(var e=0,g=m.length;e<g;e++){f=m[e].replace(/[\n]/g,"");if(h.indexOf("&lt;")>-1||h.indexOf("&gt;")>-1)p="[xnlink]"+f+"[/xnlink]\n";else p="[xnlink]"+f+"[/xnlink]";h=h.replace(f,p)}}o={msg:h=(h=h.replace(/&lt;/g,"<")).replace(/&gt;/g,">")};break;case"8":o={url:h.substring(h.indexOf("videoUrl:")+9,h.indexOf(" pictureurl")-1),pictureurl:h.substring(h.indexOf("pictureurl=")+12,h.indexOf(" oldfile=")-1)};break;default:"ch"==h?h="查看排队情况":"fq"==h&&(h="放弃排队");var d=new RegExp(/\[[0-9]*\].+[\n]/g);if(d.test(h)){var m=(h=h.replace("&amp;lt;![CDATA[","").replace("<![CDATA[","").replace("]]>","")).match(d);if(((h=h.replace(/&amp;/gi,"&")).indexOf("&lt;")>-1||h.indexOf("&gt;")>-1)&&(h=h.replace(/[\n]/gi,"")),m&&m.length>0)for(var e=0,g=m.length;e<g;e++){var f=m[e].replace(/[\n]/g,"");if(h.indexOf("&lt;")>-1||h.indexOf("&gt;")>-1)p="[xnlink]"+f+"[/xnlink]\n";else var p="[xnlink]"+f+"[/xnlink]";h=h.replace(f,p)}}o={msg:h=(h=h.replace(/&lt;/g,"<")).replace(/&gt;/g,">")}}a=t.extend(a,i.defStyle,o);var v=t.chatManage.get();v&&v.receive(a)}}),t(".ntalker-historymessage-status").css({display:"block"}).html(t.lang.history.drag_for_more)},errorHistoryMessage:function(){t(".ntalker-historymessage-status").html(t.lang.history.fail_to_load),t.Log("there are some error when request historyPage")},checkHistoryVersion:function(){return 2===this.config.history_version&&t.global.shortid&&!/^guest/.test(t.global.shortid)?2:1},sendFirstMessage:function(){if(this.requestRobot&&0!==this.config.enable_robotgreeting&&1==t.server.robot){if(!this.config.robot_greeting)return;this.showMessage("left",{msgid:"welcome_robot",type:1,history:1,msg:this.config.robot_greeting||""})}else if(0!==this.config.enable_artificialgreeting){if(2==t.server.robot&&this.robotKf)return;var e=this.config.greet_detail?this.config.greet_detail:t.utils.handleLinks(t.lang.system_first_news,{name:this.config.name});this.showMessage("left",{msgid:"welcome",type:1,msg:e})}},send:function(e,i,s){var n;e.flowid&&(n=e.flowid,e=e.message);var a=t.getTime(),o={localtime:a,timerkeyid:a,msgid:this.getMsgId(a)};if(n&&(o.flowid=n),e="string"==typeof e?t.extend({},this.defData,o,{msg:e.replace(/</gi,"&lt;").replace(/>/gi,"&gt;")}):t.extend({},this.defData,o,e),!this.connected)return/FAILURE|QUEUE/i.test(this.statusConnectTChat)||(t.Log("connected:"+this.connected+", statusConnectTChat:"+this.statusConnectTChat+", start",1),this.statusConnectTChat="QUEUE",this.start(e)),this.hashCache.add(e.msgid,e),!1;if("string"==typeof e.msg&&-1===e.msg.indexOf("faqvote:")&&(e.msg=t.enCut(e.msg,this.inputMaxByte)),t.Log(this.settingid+":chatMode.send("+(t.isObject(e)?t.JSON.toJSONString(e):e)+")",1),1==e.type||2==e.type&&1==e.emotion){var r=t.extend({},e);i&&(r.msg=i),r.msg.indexOf("faqvote:")>-1&&s?(e.msg=s,e.hidden=r.msg,r.msg=s,this.showMessage("right",r)):this.showMessage("right",r)}else/^(2|4|6)$/gi.test(e.type)&&this.hash.add(e.msgid,e);return/^(1|2|4|6)$/gi.test(e.type)&&(this._sendNum++,this._changeCsrNum++,this._changeCsrNum==this._changeCsrMaxNum&&this.view.disableButton("csr",!1)),this.connect&&this.connect.sendMessage(e),this.clearMessageCount(e),!0},noticeMessageCountNew:function(t){"function"==typeof webInfoChanged&&t&&/(^1|2|4|6|7)$/i.test(t.type)&&"welcome"!==t.msgid&&1!=t.history&&"true"!=t.msgsystem&&(this.receiveMsgCount++,webInfoChanged(400,'{"num":'+this.receiveMsgCount+', "showNum":1}',!1))},clearMessageCount:function(){this.noticeMessageCount=0,"function"==typeof webInfoChanged&&webInfoChanged(400,'{"num":0, "showNum":1}',!1)},resend:function(t){if(!this.hash.contains(t))return!1;this.send(this.hash.items(t))},predictMessage:function(e){this.connected&&this.connect&&(t.Log("$.chatMode.predictMessage("+e+")"),this.connect.predictMessage(e),2==t.server.robot&&this.robotKf&&this.view.isRobotSuggest&&this.robot2GetSuggest(e))},_filterReceive:function(e){var i=this;return this.user.id==e.userid||t.base.checkID(e.userid)===t.CON_VISITOR_ID?e.msgid=e.msgid?e.msgid:this.getMsgId(e.timerkeyid):1!=+e.history&&/^(1|2|4)$/.test(e.type)&&(t.promptwindow.startPrompt("",t.lang.news_new,!0),this.manageMode.callReceive(this.settingid),this.selected||this.unread++),e.msgid=e.msgid||e.timerkeyid,this.jetLag?e.timestamp=e.timestamp+parseInt(this.jetLag):e.timestamp=e.timestamp,e.timerkeyid=e.timestamp,e.localtime=e.timestamp,1==e.msgType?(this.view.updateMessage(e.msgid,1,t.lang.system_send_failure),this.callTrack("10-01-04","flash timeout, message send failure"),!1):2==e.msgType?!t.isObject(e.msg)&&(this.callTrack("10-01-04","common message send failure"),this.view.updateMessage(e.msgid,1,t.lang.system_send_failure),!1):9===e.type?(this.callTrack("10-01-04","message is too fast to send"),e.msgid=e.msgid||this.getMsgId(e.timeData),this.view.updateMessage(e.msgid,1,t.lang.system_send_failure),this.view.displayStatusInfo&&(this.view.displayStatusInfo(!0,t.lang.system_fast_messaging),this.floatTimeID=setTimeout(function(){clearTimeout(i.floatTimeID),i.floatTimeID=null,i.view.displayStatusInfo(!1)},3e3)),!1):e},showMessage:function(e,i){1==i.type&&"inputting"!=i.tag&&(i.msg=nTalk.filterXSS(i.msg));var s=t.getTime(),n=this;if(1!=this.config.leftchat||0==this.startType||"system"!=e){if(2!=i.history&&(i=t.extend({localtime:s,timerkeyid:s,msgid:this.getMsgId(s),msg:""},"left"==e?this.dest:this.defData,i)),1==i.type&&i.url){var a=this.supMedia(i.url,i.msgid,i.msg);i.msg=a.temp,e=a.position}if(!this.hash.contains(i.msgid)||2==i.history){if(i.msgid.indexOf("welcome")>-1&&(i.timerkeyid=-1,i.localtime=-1),i.logo&&(i.logo=t.protocolFilter(i.logo)),i.url&&(i.url=t.protocolFilter(i.url)),i.sourceurl&&(i.sourceurl=t.protocolFilter(i.sourceurl)),i.mp3&&(i.mp3=t.protocolFilter(i.mp3)),i.msg&&"string"==typeof i.msg&&i.msg.indexOf("xnlink")>-1&&(i.xnlink=!0),i.systype){if("2"===i.systype){for(2===this.connect.connect.robotQueue||i.history||(this.callStat("11"),this.connect.connect.robotQueue=2,this.connect.connect.clearSessionIdle(),this.view.disableButton("manual",!0));-1!==i.msg.indexOf("\n");)i.msg=i.msg.replace("\n","<br>");var o=i.msg.match(new RegExp(/[0-9]+/gi));if(o&&o.length>0&&o[0]){var r='<font class="chat-view-queue-num" style="'+t.STYLE_BODY+'color:red;font-weight:bold;">'+o[0]+"</font>";i.msg=i.msg.replace(/[0-9]+/,r)}}else"1"!==i.systype||i.history?("3"!==i.systype||i.history||(this.callStat("23"),this.htmlsid=t.getTime(2)),"4"!==i.systype||i.history||this.callStat("10"),this.connect.connect.robotQueue=0,this.view.disableButton("manual",!1)):this.connect.connect.robotQueue=1;if(e="left","2"===i.systype||"5"===i.systype){var h=this.config.robotSystemMessage||this.robotSystemMessage;t.each(h,function(e,s){if("message"==e)i.msg=t.utils.handleLinks(i.msg.replace(s,"[link message={$settingid} source=2]"+s+"[/link]"));else{s=s.split(",");for(var a=0;a<s.length;a++){var o='<a style="'+t.STYLE_BODY+"display:inline-block;color:#005ffb;text-decoration:none;font-size:"+(t.browser.mobile?14:12)+'px;" href="javascript:void(0);" onclick="nTalk.chatManage.get(\''+n.settingid+"').send('"+e+"', '"+s[a]+"');return false;\" >"+s[a]+"</a>";i.msg.indexOf(s[a])>-1&&(i.msg=i.msg.replace(s[a],o))}}})}i.msgid="robot_toast"+(/2|4|5/gi.test(i.systype)?2:i.systype),i.type=1,i.msg=i.msg,i.fontsize=t.browser.mobile?14:12,t("."+i.msgid).length>0&&t("."+i.msgid).remove()}return this.hash.add(i.msgid,i),this.view.showMessage(e,i)}}},supMedia:function(t,e,i){return this.view.supMedia(t,e,i)},_sendGoodsinfo:function(){var e,i=this;this.options.itemid&&(this.callStat("20"),e=this.server.mcenter+"/goodsinfo/api.php?"+t.toURI({siteid:this.siteid,itemid:this.options.itemid,itemparam:this.options.itemparam,sellerid:this.options.sellerid,user_id:t.global.shortid}),this.hashCache.add(t.getTime(1),{type:5,msg:{msgtype:5,productInfoURL:e+"&type=2&ts="+t.getTime()}}),window[this._callbackGoodsinfo]||t.browser.mobile&&!this.CON_MOBILE_SHOW_GOODSINFO?t.Log("CON_MOBILE_SHOW_GOODSINFO:"+this.CON_MOBILE_SHOW_GOODSINFO):(window[this._callbackGoodsinfo]=function(t){i._showGoodsinfo(t)},t.require(e+"&type=jsonp&lan="+t.lang.language+"&callback="+this._callbackGoodsinfo+"#rnd",function(e){t(e.error?e.target:e).remove()})))},_showGoodsinfo:function(t){t?this.showMessage("goods",{type:13,msg:t}):this.showMessage("goods",{type:3})},isVisitor:function(e){return t.base.checkID(e)===t.CON_VISITOR_ID},getDest:function(e){var i=this.config;if(t.Log("chatMode.getDest("+e+")"),e)return temp=i.icon||i.list||i.toolbar||i.featureset||null,temp&&temp.members.groupID&&temp.members.idList.length?temp.members.groupID:"";if(this.dest&&this.dest.id&&this.dest.id!=this.robotID&&this.dest.id!=t.CON_SINGLE_SESSION&&-1==this.dest.id.indexOf("GT2D"))return this.dest;this.dest.id="",this.dest.name="";var s=(i.icon||i.list||i.toolbar||i.featureset).members;return{id:s.idList[0],name:s.nameList[0],sign:s.sigList[0]}},setDest:function(e){var i=this;(e=e||{}).phone&&t.browser.mobile&&this.manageMode.view.setPhoneNumber(e.phone),e.logo&&e.logo.indexOf("rand")<0&&(e.logo=e.logo+"?rand="+nTalk.randomChar()),t.Log(this.settingid+":chatMode.setDest("+(e?t.JSON.toJSONString(e):"")+")"),t.each(e,function(t,e){i.dest[t]=e||i.dest[t]}),e&&!t.isEmptyObject(e)&&this.addDestList({id:e.id,name:e.name,logo:e.logo}),this.config&&"trial"==this.config.mode?this.dest.title=t.lang.chat_title_ext+" "+this.dest.name:this.dest.title=this.dest.name,this.dest.attr={width:t.browser.mobile?35:55,height:t.browser.mobile?35:55},this.dest.logo?(t.CON_MULTIPLAYER_SESSION===this.dest.logo||this.userNumber>1&&!t.browser.mobile?this.dest.logo=t.imagemultiplayer:t.CON_SINGLE_SESSION===this.dest.logo&&(this.dest.logo=t.imagesingle),this.selected&&this.manageMode.callSetDest(this.settingid,t.extend({},this.dest)),t.require(this.dest.logo+"#image",function(e){this.src===i.dest.logo&&(!0!==this.error?(i.dest=t.extend({},i.dest,{logo:i.dest.logo,image:this,attr:t.zoom(this,i.dest.attr.width,i.dest.attr.height)}),i.hashDest.items(i.dest.id,t.extend({},i.dest))):i.dest.logo=t.imagesingle,i.selected?i.manageMode.callSetDest(i.settingid,t.extend({},i.dest)):i.manageMode.callSetDestStatus(i.settingid,t.extend({},i.dest),!0))})):i.selected&&(i.dest.logo=i.userNumber>1?t.imagemultiplayer:t.imagesingle,i.manageMode.callSetDest(this.settingid,t.extend({},this.dest)))},setUser:function(e){this.user=t.extend(this.user,e),this.defData=t.extend(this.defData,{userid:this.user.id||"",name:this.user.name||"",logo:this.user.logo||""})},showInputState:function(e){var i="background:transparent url("+t.sourceURI+"images/mobileicon.png) no-repeat -22px -250px;",s=this.hashDest.items(e);this.showMessage("bottom",{userid:s?s.id:e,name:s?s.name:"",logo:s?s.logo:"",tag:"inputting",type:1,msg:['<span class="view-history-body-wait" style="',t.STYLE_NBODY,"margin:0 10px;display:block;width:32px;height:20px;",i,'"></span>'].join("")}),this.view.showInputState()},initConfig:function(){var e;this.options.config&&!t.isEmptyObject(this.options.config)?(this.switchUI(this.CON_VIEW_WINDOW,"LOAD_COMPLETE"),this.config=t.extend({settingid:this.settingid},this.options.config),this.options.config.service?this.server=t.extend({},t.server,t.protocolFilter(this.options.config.service)):(t.Log("config file version error.",3),this.server=t.extend({},t.server,{tchatserver:"",tchatgoserver:"",filetranserver:""})),this.config.logo=t.protocolFilter(this.config.logo),"1"==this.server.robot&&"1"==this.config.robot&&this.server.roboturl&&(1==this.options.manual?this.requestRobot=!1:0===this.config.robot_mode&&(!this.config.robot_inherits_state||1==this.config.robot_inherits_state&&t.default_connect_robot)&&(this.requestRobot=!0),t.Log("nTalk.chatMode.initConfig(): requestRobot:"+this.requestRobot)),this._initChatConfig(),e=!t.browser.mobile&&this.config.logo?'<p style="'+t.STYLE_BODY+'background-color:transparent;text-align:center;"><img data-type="ntalk-enterprise-logo" src="'+this.config.logo+'" style="'+t.STYLE_BODY+'text-align:center;display:inline;" onerror="nTalk.loadImageAbnormal(this, event)" onload="nTalk.imgScrollBottom()"/></p>':"",this.setDest({id:this.siteid,logo:this.config.logo||"",name:t.utils.handleLinks(t.lang.system_title_news,{name:this.config.name||""}),status:0}),this.showMessage("first",{type:0,msg:e}),window.IScroll&&!/^guest/.test(t.global.shortid)&&(e||(t(".first").css({width:"100%",height:"0"}),t(".view-history-system").css({width:"100%",height:"0"})),this.requestHistoryMessage()),this.sendFirstMessage(),1==this.config.enable_audio&&this.audioInit(),t.base.fire("OpenChatWindow",[])):this.switchUI(this.CON_VIEW_ERROR,"LOAD_FAIED")},audioInit:function(){var e=this;t.Audio&&t.Audio.start(this.server.filetranserver,{action:"uploadaudio",roomid:"T2D",siteid:this.siteid,settingid:this.settingid},function(i){t.Log("set Audio Button disabled:"+i,2),e.view.disabledAudioButton(i)})},audioUpload:function(e,i){var s,n,a,o=this;if("uploading"===e.status)this.uploadingid[i]||(this.uploadingid[i]="temp",this.uploadingid[i]=this.showMessage("right",{type:6,msg:"uploading"})),s=(e.event.loaded/e.event.total*100).toFixed(2),this.uploadingid[i]&&"temp"!=this.uploadingid[i]&&this.view.audioProgress(this.uploadingid[i],s);else if("success"===e.status)var r=setInterval(function(){if(o.uploadingid[i]&&"temp"!=o.uploadingid[i]){clearInterval(r),n=e.event.target||e.event.currentTarget||e.event.srcElement,t.Log(n.responseText);try{a=t.JSON.parseJSON(n.responseText)}catch(t){}a.type=6,a.sourceurl=a.url,a.url=a.mp3,a.duration=a.length,delete a.mp3,o.view.updateMessage(o.uploadingid[i],6,a),t.Log("audioUpload:"+t.JSON.toJSONString(a),2),o.send(t.extend(a,{msg:a})),o.view.showAudioResult(o.uploadingid[i]),o.uploadingid[i]=""}},200);else"error"===e.status?o.view.showAudioResult(o.uploadingid[i]):t.Log(e,3)},_initChatConfig:function(){var e,i=this,s=[];if(t.isDefined(this.config.message_skin)&&("chat/2"==this.config.message_skin||""===this.config.message_skin||this.config.message_skin.indexOf("|")>-1))this.config.message_skin=this.config.message_skin?this.config.message_skin:"#2c2c2e|#474749",this.config.startColor=this.config.message_skin.substr(0,this.config.message_skin.indexOf("|")),this.config.endColor=this.config.message_skin.substr(this.config.message_skin.indexOf("|")+1);else{var n={"chat/1":"#4297e0","chat/3":"#575757","chat/4":"#f25488","chat/5":"#52ab52","chat/6":"#9bc942","chat/7":"#4297e0","chat/8":"#4297e0","chat/9":"#4297e0","chat/10":"#4297e0"};n[this.config.message_skin]?this.config.startColor=this.config.endColor=n[this.config.message_skin]:this.config.startColor=this.config.endColor=this.config.message_skin}this.config.chatBackground=t.isDefined(this.config.message_content_skin)?this.config.message_content_skin:"#FFFFFF",this.view.disableButton("face",0===this.config.enable_face),this.view.displayButton("face",0===this.config.enable_face),this.view.disableButton(["image","file"],0===this.config.transferfiles),0===this.config.transferfiles||t.browser.android&&0===this.config.androidtransf||t.browser.mobile&&!t.browser.android&&0===this.config.othertransf?this.view.displayButton(["image","file"],!0):this.view.displayButton(["image","file"],!1),t.browser.mobile&&(0===this.config.enable_audio||2==this.config.enable_audio&&t.browser.gecko)&&this.view.hideAudioButton(),this.view.disableButton("history",0===this.config.chatingrecord),this.view.displayButton("history",0===this.config.chatingrecord),this.view.disableButton("loadhistory",1!=this.config.viewchatrecord),this.view.displayButton("loadhistory",1!=this.config.viewchatrecord),this.view.disableButton("evaluate",0===this.config.evaluation),this.view.displayButton("evaluate",0===this.config.evaluation),this.view.disableButton(["capture","capoptions"],0===this.config.captureimage),this.view.displayButton(["capture","capoptions"],0===this.config.captureimage),this.view.disableButton("csr",1!=this.config.changecsr),this.view.displayButton("csr",1!=this.config.changecsr),this.view.displayButton("xiaonengver",0===this.config.xiaonengver),this.requestRobot&&0===this.config.robot_mode&&this.view.switchToolbar(!1);var a=!0;this.config.faces=this.config.faces||[],e={id:"-1",name:"",icon:"",pics:[]},t.each(t.lang.editorFaceAlt,function(i,s){a&&(e.icon=t.sourceURI+"images/faces/"+i+(t.browser.msie6?".gif":".png"),a=!1),e.pics.push({id:i,url:t.sourceURI+"images/faces/"+i+(t.browser.msie6?".gif":".png"),sourceurl:t.lang.editorFaceAlt[i]})}),this.config.faces.length&&"-1"==this.config.faces[0].id||this.config.faces.unshift(e),!this.config.rightlabel||t.isEmptyObject(this.config.rightlabel)?this.config.rightlabel=t.lang.rightlabel:this.config.rightlabel=t.merge({},this.config.rightlabel),t.each(this.config.rightlabel,function(e,n){switch(e){case"about":var a=i.config.introduction,o=/\[tab\s+(.*?)\](.*?)\[\/tab\]/gi;o.test(a)?(a=a.replace(o,"$1"),a=t.utils.handleLinks(a,{siteid:i.siteid,user_id:t.global.shortid,lang:t.language||"",itemid:i.itemid||"1111",erpparam:t.global.erpparam||"",itemparam:i.options.itemparam,sellerid:i.options.itemparam?"":i.options.sellerid}),s.push(t.extend(n,{data:a}))):a&&s.push(t.extend(n,{data:a}));break;case"faq":i.config.faqlist&&i.config.faqlist.length&&s.push(t.extend(n,{data:i.config.faqlist||[]}));break;case"linkinpage":s.push(n);default:var r=t.extend({},n);r.data=t.utils.handleLinks(n.data,{siteid:i.siteid,user_id:t.global.shortid,itemid:i.itemid||"1111",itemparam:i.options.itemparam}),r.data&&s.push(r)}}),this._moreData=s,this.manageMode.callConfigLoaded&&this.manageMode.callConfigLoaded(this.settingid,this.config,s),this.displayMoreData()},displayMoreData:function(){if(this.view.displayButton&&!t.browser.mobile)return this._moreData&&this._moreData.length&&!1!==t.global.pageinchat?("1"!=this.config.autoexpansion||this.getExpansionStatus()||(this.view.chatElement.find(".chat-view-exp")&&this.view.chatElement.find(".chat-view-exp").html(t.lang.button_more+" &lt;"),this.toggleExpansion(this.settingid)),!1):(this.view.displayButton("exp",!0),!0)},getCustomerServiceInfo:function(e,i,s){this.callTrack("10-01-05","start t2d connect");var n,a=this;this.callMethod=this.callMethod||window,this.callBack="callBack_chat_"+t.randomChar(),this.callMethod[this.callBack]=function(){"function"==typeof window.nTalk.fIM_getSessionCustomerServiceInfo?window.nTalk.fIM_getSessionCustomerServiceInfo.apply(a,arguments):window.nTalk.Log("nTalk.fIM_getSessionCustomerServiceInfo is undefined",3)},this.requestRobot?(this.dest.destid=this.robotID,n={status:1,userid:this.dest.destid,nickname:this.config.robot_name||t.lang.robot_name,usericon:this.config.robot_logo||"",signature:"",sessionid:""},this.callMethod[this.callBack](n,this.settingid)):this._getCustomerServiceForT2dStatus(e,i,s)},changeCustomerServiceInfo:function(){this.startCSSwitch="START",2==t.server.robot&&(this.t2dMode=0,this.lastSessionID=""),this.getCustomerServiceInfo(this.getDest(!0),0,this.getDest().id)},manualServiceInfo:function(){this.send(t.lang.button_switch_manual),this.view.disableButton("manual",!0)},_getCustomerServiceForT2dStatus:function(e,i,s){t.Log("chatMode._getCustomerServiceForT2dStatus("+e+", "+i+")",1);var n,a=this,o=t.base.checkID(e);if(this._connectTimeout)t.Log("Connect tchat...",2);else if(t.user.id&&t.global.pcid)if(!1===o||o!=t.CON_CUSTOMER_ID&&o!=t.CON_GROUP_ID)this.showMessage("system",{type:9,msg:t.lang.system_no_user});else{var r={};if(2==t.server.robot){var h=this.lastSessionID||this.sessionid?this.lastSessionID||this.sessionid:null,c=this.t2dMode,l=s||(this.dest&&this.dest.id&&0===t.base.checkID(this.dest.id)?this.dest.id:null);r={sid:h,trf:c,ruids:l=null===this.t2dMode?null:l}}n=t.toURI(t.extend({query:"requestchat",sitid:this.siteid,uid:t.user.id,uids:e,ruids:s,issingle:i,cid:t.global.pcid,type:t.global.isvip,userlevel:t.global.userlevel,usertag:t.global.usertag,userrank:t.global.userrank,callbackname:this.callBack},1==t.flashserver.reversechat?{}:{settingid:this.settingid},r),!0),this.view.displayStatusInfo&&"QUEUE"!==this.statusConnectT2D&&this.view.displayStatusInfo(!0,t.lang.system_allocation_service),t.Log("QueryString:"+n),t.Log(":::"+this.server.t2dstatus+"?"+n+"#rnd",1),this.statusConnectT2D="QUERY",t.require(this.server.t2dstatus+"?"+n+"#rnd",function(e){t.Log("request t2dstatus complete: error:"+(e.error||"")+", reconnect:"+a._reconnectCount+", statusConnectT2D:"+a.statusConnectT2D),(e.error||"QUERY"==a.statusConnectT2D)&&(a.callTrack("10-01-07","t2d abnormal"),a._reconnectCount++,a.statusConnectT2D="WAIT",a._reconnectCount<3?setTimeout(function(){a.reconnect()},1e3):(a._reconnectCount=0,a._failure("3TH_REQUEST"))),t(e.error?e.target:e).remove()})}},callBackCustomerServiceInfo:function(e){var i=this,n="";if(this.options.edu_invisitid&&t.isEdu&&3==e.status&&(e.status=1),1==this.options.config.leftchat&&0!=this.manageMode.chat.startType&&(n=this.options.config.announcement||t.lang.leftchat_message,this.showMessage("left",{type:1,msg:n})),t.Log(this.settingid+":chatMode.callBackCustomerServiceInfo("+t.JSON.toJSONString(e)+")",1),!e||e.error||3!=e.status&&(!e.userid||!e.externalname&&!e.nickname))return this.callTrack("10-01-07","result params abnormal"),"no free users"==e.error?n=t.lang.system_no_free_user:"over rechatnum"==e.error?(n=t.lang.system_over_rechatnum,this.view.disableButton("csr",!0)):"no user2"==e.error&&(n=t.lang.system_no_user),""!==n?(this.showMessage("system",{type:9,msg:n}),this.callStat("13"),this.statusConnectT2D="COMPLETE",this.view.displayStatusInfo&&this.view.displayStatusInfo(!1),this._stopQueue(),void(this.robotKf&&setTimeout(function(){i.t2dMode=null,i.reconnect(),t.Log("please set manual customer in robot setting group")},2e3))):(this._abnormal(e.error||""),this.startCSSwitch="",void(this.view.displayStatusInfo&&this.view.displayStatusInfo(!1)));if(this.callTrack("10-01-06","success"),"START"==this.startCSSwitch&&(this.startCSSwitch="SHOW"),this._clearChangeCsrNum(),this.sessionid=e.sessionid||"",t.Log("get sessioId>>"+this.sessionid,1),e.usericon="null"==e.usericon?"":e.usericon,e.usericon="null"==e.usericon?"":e.usericon,this.setDest({id:e.userid,name:e.externalname||e.nickname||"",sign:e.signature||"",logo:t.protocolFilter(e.usericon||""),status:e.status||0,phone:e.mobile||e.phone||""}),this.callMethod[this.callBack]=s,e.status===this.CON_OFFLINE?(this.statusConnectT2D="COMPLETE",this._offline()):e.status===this.CON_BUSY?(this.statusConnectT2D="QUEUE",this._queueNum=+e.num+1,this._busy()):(this.statusConnectT2D="COMPLETE",this._online()),2==t.server.robot&&1==e.usertype&&this.setRobot2Param(!0),0!==this.config.sessioncarry){var a={};window.localStorage.carry_dest?a=t.JSON.parseJSON(window.localStorage.carry_dest):a[this.settingid]=this.dest.id;var o={};for(k in a)k!==this.settingid&&(o[this.settingid]=this.dest.id);a=t.JSON.toJSONString(t.extend(a,o)),window.localStorage.carry_dest=a}this.config.enable_starLevel&&!i.getStarLevel&&(i.getStarLevel=!0,window.startLevel=function(e){try{t.evaluateStarLevel=5,e>=55&&e<=59?t.evaluateStarLevel=4:e<55&&(t.evaluateStarLevel=3)}catch(e){t.Log("startLevel.callback:"+e.message,3)}},startLevelData={siteid:i.dest.id.substr(0,i.dest.id.indexOf("_ISME")),kfid:i.dest.id,callback:"startLevel"},t.require(t.server.settingserver+"/index.php/api/setting/returnCount?"+t.toURI(startLevelData)+"#rnd",function(){i.view.starLevel&&i.view.starLevel(t.evaluateStarLevel)}))},setRobot2Param:function(t){t?(this.robotKf=!0,this.view.switchToolbar(!1),this.t2dMode=2):(this.robotKf=!1,this.view.switchToolbar(!0),this.t2dMode=null)},_abnormal:function(e){var i=t.utils.handleLinks(t.lang.system_abnormal,{settingid:this.settingid});this.callStat("13"),this.connected=!1,this._stopQueue(),this.showMessage("system",{type:9,msg:i}),t.Log("Customer information request an exception.("+e+")",3)},_failure:function(e){var i=t.utils.handleLinks(t.lang.system_failure,{settingid:this.settingid});this.view.displayStatusInfo&&this.view.displayStatusInfo(!1),this.connected=!1,this._stopQueue(),this.showMessage("system",{type:9,msg:i}),t.Log("Customer information request fails.("+e+")",3)},_offline:function(){var e=t.utils.handleLinks(t.lang.system_offline,{destname:this.dest.name,settingid:this.settingid});this.view.displayStatusInfo&&this.view.displayStatusInfo(!1),this.callStat("12"),this.connected=!1,this._stopQueue(),this.showMessage("system",{msg:e,type:9}),1==this.server.robot&&this.server.roboturl&&1==this.config.robot&&(parseFloat(this.config.robot_mode)>0||1==this.options.manual)?this.switchServerType(!1,"OFFLINE"):this.switchUI(this.CON_VIEW_MESSAGE,"OFFLINE")},_online:function(){var e=this;this.view.displayStatusInfo&&(this.view.displayStatusInfo(!1),t.browser.safari&&!navigator.cookieEnabled&&setTimeout(function(){e.view.displayStatusInfo(!0,t.lang.system_cookie,{"font-size":"12px","line-height":"27px",padding:"0 45px"},!0)},1e3)),this.callStat("10"),this._stopQueue(),t.Log("connect user "+this.dest.name+"...",1),this.createConnect()},_busy:function(){var e,i,s;if(this.connected=!1,this.view.displayStatusInfo&&this.view.displayStatusInfo(!1),this._startQueue)this.view.chatHistory.find(".chat-view-queue-num").html(this._queueNum.toString());else{if(1==this.server.robot&&this.server.roboturl&&1==this.config.robot&&2==parseFloat(this.config.robot_mode))return this.statusConnectT2D="COMPLETE",void this.switchServerType(!1,"BUSY");if(!0!==this._startQueue){this._startQueue=!0,this.callStat("11");var n=this;this.view.disableButton(["image","file","submit"],!0),this._queueTime=0,this._queueTimeID=setInterval(function(){n._queueTime%3==0&&n.getCustomerServiceInfo(n.options.destid,n.options.single,""),n._queueTime++,n.view.chatHistory.find(".chat-view-queue-time").html(t.secondsToMinutes(n._queueTime))},1e3)}if(!this.view.chatHistory.find(".chat-view-queue-num").length){i='<font class="chat-view-queue-num" style="'+t.STYLE_BODY+'color:red;font-weight:bold;">'+this._queueNum.toString()+"</font>",s="",toRobotMessage="";var a,o;t.browser.mobile?(a=t.lang.system_mobile_queue1||t.lang.system_queue1,o=t.lang.system_mobile_queue2||t.lang.system_queue2):(a=t.lang.system_queue1,o=t.lang.system_queue2),queue1message=t.utils.handleLinks(o,{settingid:this.settingid,count:i,time:s}),e=t.utils.handleLinks(a,{settingid:this.settingid,count:i,time:s,br:"",torobot:toRobotMessage}),1===this.config.disable_message?this.showMessage("system",{type:0,msg:queue1message}):this.showMessage("system",{type:0,msg:e}),this.view.changeQueueStyle()}}},_stopQueue:function(){this._startQueue=!1,clearInterval(this._queueTimeID),this.view.disableButton(["image","file","submit"],!1)},_ready:function(e,i){t.Log(this.settingid+"::chatMode._ready()",1),this.connect&&this.connect.stopSwitchConnect(),this.statusConnectTChat="READY","zh_cn"!==t.lang.language.toLowerCase()&&(this.debug&&t.Log(this.settingid+":chat.connect.setTextStyle"),this.connect&&this.connect.setTextStyle({fontsize:20})),this.callStat("4")},_connectSuccess:function(e){this.callTrack("10-01-02","connect success");var i,s=this,n=0;e&&(i="string"==typeof e?t.JSON.parseJSON(e):e,this.setUser({id:i.myuid||"",name:i.myuname||"",sign:i.signature||"",logo:t.protocolFilter(i.mylogo||"")}),this.sessionid=i.sessionid||"",this.sessionid&&this.callStat("0"),this.jetLag=t.getTime()-i.timesample,1==t.server.robot&&this.mergeSession(this.dest.id,this.sessionid,function(){t.Log("merge session")})),this._stopConnectTimeout(),this.statusConnectTChat="COMPLETE",t.Log("connect "+this.dest.name+" complete",1),"function"==typeof im_destUserInfo?im_destUserInfo({id:this.dest.id,name:this.dest.name}):t.browser.mobile&&t.postMessage(window.parent,["destInfo",this.dest.id,this.dest.name].join(","),"*"),t.browser.mobile&&this.manageMode&&t.isFunction(this.manageMode.view.updateViewStatus)&&this.manageMode.view.updateViewStatus(!1),this.view.removeMessage("system"),"SHOW"!=this.startCSSwitch||this.requestRobot||(this.userList=[],this.startCSSwitch="",this.showMessage("system",{type:9,msg:t.utils.handleLinks(t.lang.system_switch_session,{destname:this.dest.name})})),t.waitMessage.each(function(t,e){s.waitTimeID[s.waitTimeID.length]=setTimeout(function(){s.send(e)},n),n+=600}),this._sendGoodsinfo(),this.hashCache.each(function(t,e){s.cacheTimeID[s.cacheTimeID.length]=setTimeout(function(){s.send(e)},n),n+=600}),this.hashCache.clear(),this.view.disableButton("history",!1),this.requestRobot||1!=this.config.robot_inherits_state||(t.default_connect_robot=!1)},_connectException:function(){t.Log(this.settingid+":chatMode._connectException()"),this.connected=!1,this.statusConnectTChat="FAILURE",this.showMessage("system",{type:9,msg:t.utils.handleLinks(t.lang.system_connect_wait,{settingid:this.settingid})})},_connectResult:function(e,i,s){if(s=t.hexToDec(s),t.Log(this.settingid+":chatMode.connectResult("+t.JSON.toJSONString(arguments)+")"),this.connected&&e===this.CON_CLOSE_CONNECT)this.statusConnectTChat="CLOSECHAT";else switch(this.connected&&e===this.CON_DISCONNECT&&this.disconnect(),this.connected||e!==this.CON_LOGIN_SUCCESS||(this.connected=!0),e){case this.CON_LOGIN_SUCCESS:this.view.disableButton("capture",!1),this._connectSuccess(i);break;case this.CON_LOGIN_FAILURE:case this.CON_CONNECT_FAILURE:this.view.disableButton("capture",!0),this._connectException()}},mdyServerAddr:function(t){return t.replace(/\/flashgo/i,"/httpgo")},setFlashGoServer:function(e){var i;t.Log(this.settingid+':chatMode.setFlashGoServer("'+e+'")'),e&&(e=this.mdyServerAddr(e),i=/cid=(\-?\d+)/gi.exec(e),this.chatFlashGoUrl=t.protocolFilter(e),this.chatgourl=t.protocolFilter(e.substr(0,e.indexOf("?"))),this.clientid=i&&2==i.length?i[1]:"")},notifySessionSence:function(e){t.Log("chatMode.notifySessionSence("+e+")",1);try{e=t.JSON.parseJSON(e)}catch(t){}1===e.evaluable?this._Evaluable=!0:this._Evaluable=!1,1===e.enableevaluation?this._Enableevaluation=!0:this._Enableevaluation=!1,2==t.server.robot&&(0===e.scenemode?this.setRobot2Param(!1):1===e.scenemode&&this.setRobot2Param(!0)),t.browser.mobile&&this.view.displayEvClose(this._Enableevaluation?1:0),this.view.disableButton("evaluate",!this._Evaluable),-1==e.score?(this._submitRating=!1,this.showMessage("info",{type:9,msg:t.lang.system_evaluation_failure})):e.score>0&&(this._submitRating=!0)},notifyUserList:function(e){t.Log(this.settingid+":chatMode.notifyUserList("+e+")");try{e=t.JSON.parseJSON(e)}catch(t){e=[]}for(var i=[],s=0;s<e.length;s++)t.base.checkID(e[s].userid)===t.CON_CUSTOMER_ID&&(i.push(e[s]),this.addDestList({id:e[s].userid||"",name:e[s].externalname||e[s].nickname||e[s].username||"",logo:e[s].usericon||""}));this.userList=i,this.userNumber=this.userList.length,t.Log(this.settingid+":chatMode.notifyUserList:"+e.length),this.userNumber>1&&this.callStat("21")},userEnter:function(e){var i,s=t.lang.system_add_session,n=!0;try{i=t.JSON.parseJSON(e)}catch(t){i=null}if(t.base.checkID(i.userid)==t.CON_CUSTOMER_ID&&0!==this.userList.length){for(var a=0;a<this.userList.length;a++)this.userList[a].userid==i.userid&&(n=!1);n&&(this.userList.push(i),this.userNumber=this.userList.length),this.userList.length>1&&this._clearChangeCsrNum(),t.Log(this.settingid+":["+this.userList.length+"]chatMode.userEnter("+e+")"),this.addDestList({id:i.userid||i.id,name:i.externalname||i.nickname||i.username||i.name,logo:i.logo||""}),s&&this.userNumber>1&&(this.enterUserId=i.userid,this.showMessage("system",{type:9,msg:t.utils.handleLinks(s,{destname:i?i.externalname||i.nickname||"":this.dest.name}),enter:1}))}},userLeave:function(e){this.enterData=null,t.Log(this.settingid+":chatMode.userLeave("+e+")");var i=t.extend({},this.hashDest.items(e));if(i&&!t.isEmptyObject(i)){if(this.userList.length<2)return;for(var s=[],n=0;n<this.userList.length;n++)this.userList[n].userid!=e&&s.push(this.userList[n]);if(this.userList=s,this.userNumber=this.userList.length,!(s=this.userList[0]))return;this.setDest({id:s.userid||"",name:s.externalname||s.nickname||"",sign:s.signature||"",logo:t.protocolFilter(s.usericon||s.logo||""),status:s.status}),i.name&&i.id&&-1==i.id.indexOf("robot")&&this.showMessage("system",{type:9,msg:t.utils.handleLinks(t.lang.system_go_away_session,{destname:i.name}),enter:1})}else t.Log("chatMode.userLeave(): dest info is null",2)},_userInfo:function(e){var i;if("object"==typeof e)i=e;else try{i=t.JSON.parseJSON(e)}catch(t){return}if(i.status===this.CON_OFFLINE||i.status===this.CON_AWAY){if(1!=this.options.config.leftchat)return this.statusConnectTChat="CLOSECHAT",void this.disconnect();i.status=1}if(this.dest.id!=i.userid&&1!=i.status)return t.Log(">userid:"+this.dest.id+"!="+i.userid+" ,>"+(this.dest.id!=i.userid)+", "+i.status+"!=1>"+(1!=i.status),1),void t.Log("Switch to is not online customer service does not update the customer information ",2);this.setDest({id:i.userid||this.dest.id,name:i.externalname||i.nickname||this.dest.name,sign:i.signature||this.dest.sign,logo:t.protocolFilter(i.usericon||i.logo||this.dest.logo),phone:i.mobile||i.phone||"",status:i.status})},addDestList:function(e){var i,s,n,a;if(e&&!t.isEmptyObject(e)&&(e.id||e.userid))return s=e.userid||e.id,n=e.externalname||e.nickname||e.username||e.name,a=e.usericon||e.logo||"",t.Log("add or update dest info:"+t.JSON.toJSONString(e),2),this.hashDest.contains(s)?(i=t.extend({},this.hashDest.items(e.id),{id:s,name:n,logo:a}),this.hashDest.items(i.id,i)):(i={id:s,name:n,logo:a},this.hashDest.add(i.id,i)),i},getMsgId:function(e){for(e=e||t.getTime();this.hash.contains(e+"J");)e++;return parseFloat(e)+"J"},mergeSession:function(e,i,s){if(this.robotSessionID){var n=this,a={siteid:this.siteid,robotsessionid:this.robotSessionID,sessionid:i||this.sessionid,destid:e,myuid:t.user.id};new t.POST(this.server.mcenter+"/message.php?m=Message&a=updateRobotMsg",a,function(e){t.Log("send hidtory message complete"),setTimeout(function(){s.call(n)},50)})}},_clearChangeCsrNum:function(){this._changeCsrNum=0,this.view.disableButton("csr",!0)},_filterNullChar:function(e){var s=this;return t.each(e,function(n,a){t.isObject(a)||t.isArray(a)?e[n]=s._filterNullChar(a):e[n]="number"==typeof a?a:a.replace(i,"")}),e},_formatEvaluationData:function(e){var i="",s=t.getTime(),n={type:5,timerkeyid:s,msgid:this.getMsgId(s)};if(e=this._filterNullChar(e),2==this.config.evaluateVersion?n.msg=t.extend({msgtype:3},{newevaluate:e}):n.msg=t.extend({msgtype:3},{evaluate:e}),2==this.config.evaluateVersion){for(var a in e)if(e[a]&&e[a].answer){var o=e[a].answer;for(var r in o)o[r]&&o[r].lab&&(i+=o[r].lab+"; ")}}else for(var a in e)if(e[a]&&e[a].value&&!t.isFunction(e[a])&&e.hasOwnProperty(a)){if("evalute_start"==e[a].name)break;"string"==typeof e[a].value?i+=e[a].value+"; ":i+=e[a].value.text+"; "}return t.Log("submitData::"+t.JSON.toJSONString(n)),{data:this._toEvaluateXML(n),info:t.enCut(i,50)}},_toEvaluateXML:function(e){var i,s;e=t.charFilter(e),i=t.whereGet(e,["type","msgid"]);for(var n in i)void 0===i[n]&&delete i[n+""];return(s={flashuid:e.timerkeyid,msg:{msg:t.extend(e.msg,{attributes:i})}}).msg.msg.newevaluate&&(s.msg.msg.newevaluate=t.JSON.toJSONString(s.msg.msg.newevaluate)),s.msg.msg.evaluate&&(s.msg.msg.evaluate=t.JSON.toJSONString(s.msg.msg.evaluate)),s.msg=t.jsonToxml(s.msg),s}},t.chatManage={name:"chatManage",view:null,options:null,hash:new t.HASH,hashWait:new t.HASH,hashConfig:new t.HASH,hashStatus:new t.HASH,objMinView:null,cacheLeft:null,cacheTop:null,htmlSID:"",connectId:"",open:function(e,i,s,n,a,o,r,h,c,l){t.Log("$.chatManage.open("+t.JSON.toJSONString(arguments)+")");var u=this;if(t.xpush&&t.xpush.clearSettingUnReadMsgCount(e),this.htmlSID=t.getTime(2),this.settingid=e||i,this.destid=i||"",this.itemid=s,this.itemparam=n,this.sellerid=a,this.single=r||(this.destid?1:0),this.manual=h||"0",this.edu_visitid=l||"",this.edu_invisitid=c||"",this.clearHistoryPageCount(),this.view&&this.objMinView&&this.objMinView.remove(),this.createClientID(),this.hash.contains(this.settingid))this.hash.items(this.settingid)&&(t.Log("$.chatManage.switchChat("+this.settingid+")",1),this.chat=this.hash.items(this.settingid),this.get(this.settingid).connect&&this.get(this.settingid).connect.connect||this.get(this.settingid).reconnect("",this.destid,this.single,this.edu_invisitid,this.edu_visitid),this.chat.selected||t.isEdu&&t.browser.mobile||this.switchChat(this.settingid));else{if(this.hashWait.contains(this.settingid))return void t.Log("wait open chat",2);this.hashWait.add(this.settingid,"wait"),t.base.showLoading(),this.loadConfig(e||t.global.settingid,function(e){t.browser.mobile?u.loadWapView(e,function(){u.initChatManage(o,e)}):u.initChatManage(o,e)},this.settingid)}return!0},loadWapView:function(e,i){var s="chat.view.wap.js";!t.flashserver.layout||"2"!=t.flashserver.layout&&"3"!=t.flashserver.layout||t.isEdu||(s="chat.view.wap.theme"+t.flashserver.layout+".js"+t.baseExt),t.require({view:s+t.baseExt},function(){i.call()})},createClientID:function(){var e=t.randomChar(20);return this.connectId=""!==this.connectId?this.connectId:"JS_"+e.toLowerCase(),this.connectId},initChatManage:function(e,i){var s,n,a=this,o={};this.view||("kf_9740"==t.global.siteid?o.position={position:"center-center"}:o.position=i?i.position:{},i&&void 0!==typeof i.resize_chat&&void 0!==typeof i.drag_chat?(o.resize=!(!t.global.pageinchat||!i||0===i.resize_chat),o.drag=!(!t.global.pageinchat||!i||0===i.drag_chat)):(o.resize=!1,o.drag=!0),n=t.ntView?t.ntView.chatManageView:t.chatManageView,t.ntView&&t.browser.mobile?this.view=new n(o,this,i.wapTheme):this.view=new n(o,this),t(window).bind("beforeunload",function(t){a.beforeunload(t)})),t.global.pageinchat||(t.Capture.captureWithMin=!1),this.view.addChatTag(this.settingid),t.browser.mobile||this.hash.each(function(t,e){e&&e.minimize()}),i&&1==i.autoconnect||"1"==t.server.reversechat?(t.Log("autoconnect:1"),e=!0):i&&-1==i.autoconnect?e=!1:(s=t.store.get(t.base.CON_LOCAL_FIX+this.settingid))&&t.getTime()-s<18e5&&(e=!0);try{i=t.protocolFilter(i)}catch(e){t.Log("error config file: "+e)}this.chat=this.createChatMode(e,i),t.browser.mobile&&0==t(".chat-view-window-header").length&&this.view._create(),this.hash.add(this.settingid,this.chat),"1"!==t.global.message?(!e&&!this.chat.requestRobot||this.chat.connected||this.chat.start(),t.store.set(t.base.CON_LOCAL_FIX+this.settingid,t.getTime())):this.chat.switchUI("message")},beforeunload:function(e){if(0!==this.hash.count()){if(this.chat.connected&&this.chat._sendNum>0&&0!==this.chat.config.sessioncarry){var i=t.JSON.parseJSON(window.localStorage.carry_dest),s={};for(k in i)k!==this.chat.settingid&&(s[this.chat.settingid]=this.chat.dest.id);i=t.JSON.toJSONString(t.extend(i,s)),window.localStorage.carry_dest=i}else window.localStorage.carry_dest="";if(!t.global.pageinchat&&!t.browser.mobile)if(this.chat&&this.chat.config&&1==this.chat.config.enableevaluation&&this.chat._Evaluable&&!this.chat._submitRating){if(this.close(),t.browser.chrome)return t.lang.system_before_evaluation;t.Event.fixEvent(e).returnValue=t.lang.system_before_evaluation}else setTimeout(function(){},500)}},loadConfig:function(e,i,s){var n,a=this,o=this.hashConfig.items(e);url=[t.server.configserver?t.server.configserver:t.server.flashserver,"config/6/",e.split("_").slice(0,2).join("_"),"_",e,".js#rnd"].join(""),t.Log("$.chatManage.loadConfig("+e+"):"+url),o||t.isEmptyObject(t.base.config)||t.base.config.settingid!=e||(o=o||t.base.config),o&&o.service&&o.service.tchatgoserver?(t.base.hiddenLoading(),s&&s.indexOf("ISME9754")>-1?a.hashWait.remove(s):a.hashWait.remove(e),(n=a.verificationDestId(o))?(t.Log("Only one customer to open a chat window",2),n.showMessage("system0",{type:9,msg:t.utils.handleLinks(t.lang.system_merge_session,{destname:n.dest.name})})):i.call(this,o)):t.require(url,function(r){t.base.hiddenLoading(),s&&s.indexOf("ISME9754")>-1?a.hashWait.remove(s):a.hashWait.remove(e),r.error||!nTalk.CONFIG&&!NTKF.CONFIG?(a.view&&a.view.toggleExpansion("rightElement",!1),i.call(a,null)):(o=nTalk.CONFIG||NTKF.CONFIG,a.hashConfig.add(e,o),(n=a.verificationDestId(o))?(t.Log("Only one customer to open a chat window",2),n.showMessage("system0",{type:9,msg:t.utils.handleLinks(t.lang.system_merge_session,{destname:n.dest.name})})):i.call(a,o)),setTimeout(function(){delete NTKF.CONFIG,delete nTalk.CONFIG},1e3),t(r.error?r.target:r).remove()})},verificationDestId:function(e){var i,s,n=!1;return!!e&&((s=e.icon||e.list||e.toolbar||e.featureset||null)&&s.members.groupID&&s.members.idList.length?(i=s.members?s.members.idList:[],!!t.isArray(i)&&(this.hash.each(function(s,a){t.inArray(a.dest.id,i)>-1&&a.settingid!=e.settingid?(t.Log("opened destid:"+a.dest.id+", idList:"+t.JSON.toJSONString(i),2),n=a):t.Log("opened destid:"+a.dest.id+", idList:"+t.JSON.toJSONString(i),1)}),n)):(t.Log("No valid entry configuration",3),!1))},createChatMode:function(e,i){return t.Log("nTalk.chatManage.createChatMode():noWaitConnect:"+e,1),new t.chatMode({config:i,siteid:t.global.siteid,settingid:this.settingid,destid:this.destid,itemid:this.itemid,itemparam:this.itemparam,sellerid:this.sellerid,single:this.single,manual:this.manual,htmlsid:this.htmlSID,connectid:this.connectId,edu_invisitid:this.edu_invisitid,edu_visitid:this.edu_visitid,usertag:t.global.usertag,userrank:t.global.userrank},this)},get:function(e,i){if(!this.hash.count())return null;if(!e)return this.chat||this.hash.first();if(this.hash.contains(e))return this.hash.items(e);if(i&&t.base.checkID(i)==t.CON_CUSTOMER_ID)for(var s in this.hash.hashTable){var n=this.hash.items(s);s&&this.hash.hashTable.hasOwnProperty(s)&&n.dest.id==i&&(e=n.settingid)}return this.hash.contains(e)?this.hash.items(e):null},close:function(){t.Log("nTalk.chatManage.close()");var e=this.settingid,i=this,s=function(){(!t.global.callStatCount||t.global.callStatCount&&0==t.global.callStatCount.success&&1==t.global.callStatCount.failure)&&t.chatManage.get().callStat("5"),t.removelistenerMessage(),i.hash.each(function(t,e){e.close()}),i.hash.clear(),t.global.pageinchat?(i.view.close(),i.view=null):t.browser.mobile?t.global.backURL?window.open(t.global.backURL):history.go(-1):(window.opener=null,t.browser.chrome||window.open("","_self"),window.close()||(window.location.href="about:blank"))};if(this.chat&&this.chat.config&&!this.chat._submitRating&&this.chat._currentView==this.chat.CON_VIEW_WINDOW&&1==this.chat.config.enableevaluation&&this.chat._Enableevaluation){if(!1===this.chat.showEvaluation(2,"",function(){s(),t.base.fire("CloseChatWindow",[{type:2,settingid:e||""}])}))try{s(),t.base.fire("CloseChatWindow",[{type:1,settingid:e||""}])}catch(e){t.Log(e,3)}}else try{s(),t.base.fire("CloseChatWindow",[{type:1,settingid:e||""}])}catch(e){t.Log(e,3)}},switchChat:function(e){t.Log("chatManage.switchChat("+e+")"),this.view.switchChatTag(e),this.callSwitchChat(e)},closeChat:function(e){var i=this.hash.next(e);t.Log("chatManage.closeChat()"),this.view.removeChatTag(e),this.switchChat(i),this.hash.items(e)&&this.hash.items(e).close(),this.hash.remove(e)},callVerification:function(e,i){var s;return t.Log("chatManage._callStart("+e+", [config Object])"),!!(s=this.verificationDestId(i))&&(this.closeChat(e),s)},callManageResize:function(t,e){this.hash.each(function(i,s){s.view.callChatResize(t,e)})},callMinimize:function(){t.Log("$.chatManage.callMinimize()");var e,i=this;e=t.ntView?t.ntView.minimizeView:t.minimizeView,this.objMinView=new e(this.chat.dest,this.chat._currentView==this.chat.CON_VIEW_MESSAGE,function(){t.isFunction(i.view.maximize)&&i.view.maximize(),i.objMinView=null})},callSwitchChat:function(e){var i=this;t.Log("chatManage.callSwitchChat("+e+")"),this.hash.each(function(t,s){s.settingid===e?(s.maximize(),s.displayMoreData()&&i.view.toggleExpansion("rightElement",!1),i.view.updateRightData(s.settingid,s._moreData),i.chat=s):s.minimize()})},callToggleExpansion:function(t){var e=this.view.toggleExpansion("rightElement");return this.hash.each(function(t,i){i.view.updateMore(e)}),e},callToggleExpansionTab:function(){return this.view.toggleExpansion("leftElement")},callConfigLoaded:function(t,e,i,s,n){this.view.updataSkin(e.chatBackground,e.startColor,e.endColor),i&&i.length&&this.view.updateRightData(t,i)},showFAQ:function(e,i,s,n){var a=this.hash.items(e);t.Log("chatManage.showFAQ()"),this.get().config.count_for_faq&&1==this.get().config.count_for_faq&&this.requestForCount(n),a.showMessage("otherinfo",{userid:a.dest.id,type:9,title:i,msg:s})},requestForCount:function(e){var i,s,n,a=t.getTime();s="ntcount_for_faq_"+t.randomChar(),t.server.kpiserver=t.protocolFilter(t.server.kpiserver),i="/"===t.server.kpiserver.charAt(t.server.kpiserver.length-1)?t.server.kpiserver+"index.php/api/comment/faq?":t.server.kpiserver+"/index.php/api/comment/faq?",n=t.toURI({siteid:this.chat.siteid,timesample:a,faqid:e,kfid:this.get().dest.id,settingid:this.chat.settingid,vid:t.global.uid||"notloggedin",time:a,sessionid:this.chat.sessionid,callback:s}),window[s]=function(e){t.Log("receive respones from kpiserver for count_for_faq"),"1000"==e.issuccess?t.Log("count_for_faq success . code :"+e.errormsg):t.Log("count_for_faq failure . errorCode :"+e.errormsg,2)},t.require(i+n+"#rnd")},callSetDest:function(t,e){this.view&&this.view.updateChatTag(t,e),this.eduWapAutoView&&this.eduWapAutoView.update(t,e),this.objMinView&&this.objMinView[0===e.status?"offline":"online"]()},callSetDestStatus:function(t,e,i){this.view&&this.view.updateChatTag(t,e,i)},callReceive:function(e){t.Log("$.chatManage.callReceive()"),this.hash.items(e).selected||this.view.labelFlicker(e),this.objMinView&&(this.objMinView.count++,this.objMinView.startFlicker())},getHistoryPageCount:function(){return t.browser.mobile?t.store.get("history")||-1:-1},clearHistoryPageCount:function(){return t.store.remove("history")},addHistoryPageCount:function(){if(!t.browser.mobile)return-1;var e=t.store.get("history")||"-1";return e=parseFloat(e)-1,t.store.set("history",e),e}},t.extend({fIM_getSessionCustomerServiceInfo:function(e,i){var s,n,a=t.chatManage.get(i);if(a){if(t.isObject(e))s=e;else try{s=t.JSON.parseJSON(e.replace(/[\r|\n]/gi,""))}catch(t){}if(1==this.options.config.leftchat)switch(s.status){case 0:this.manageMode.chat.startType=4,s.status=1;break;case 1:this.manageMode.chat.startType=0,s.status=1;break;case 3:this.manageMode.chat.startType=3,s.status=1;break;case 4:this.manageMode.chat.startType=4,s.status=1}return a.callBackCustomerServiceInfo(s),n={id:s.userid,name:s.externalname||s.nickname||"",logo:s.usericon||"",status:void 0==s.status?"":s.status,type:void 0==s.usertype?"":s.usertype},t.base.fire("DistributionService",[n]),!0}}}),t.extend({fIM_tchatFlashReady:function(e,i,s){return setTimeout(function(){var n=t.chatManage.get(s);n?n._ready(e,i):t.Log("fIM_tchatFlashReady:settingid:"+s,3)},0),!0},fIM_ConnectResult:function(e,i,s,n){return t.Log("nTalk.fIM_ConnectResult("+e+', userinfo, "'+s+'", "'+n+'")',1),setTimeout(function(){var a=t.chatManage.get(n);a&&a._connectResult(e,i,s)},0),!0},fIM_onGetUserStatus:function(e,i){return t.Log("nTalk.fIM_onGetUserStatus("+e+', "'+i+'")',2),!0},fIM_requestEvaluate:function(e,i,s,n){return t.Log("nTalk.fIM_requestEvaluate("+t.JSON.toJSONString(arguments)+")"),setTimeout(function(){var e=t.chatManage.get(n);e?e.showEvaluation(0,s):t.Log("fIM_requestEvaluate:settingid:"+n,3)},0),!0},fIM_notifyUserInputing:function(e,i){return setTimeout(function(){var s=t.chatManage.get(i);s?s.showInputState(e):t.Log("fIM_notifyUserInputing:settingid:"+i,3)},0),!0},fIM_receiveCustomerServiceInfo:function(e,i){t.Log('nTalk.fIM_receiveCustomerServiceInfo("'+e+'", "'+i+'")')},fIM_onNotifySessionSence:function(e,i){return setTimeout(function(){var s=t.chatManage.get(i);s&&s.notifySessionSence(e)},0),!0},fIM_notifyUserNumbers:function(e,i){setTimeout(function(){t.chatManage.get(i)},0)},fIM_notifyUserList:function(e,i){return setTimeout(function(){var s=t.chatManage.get(i);s&&s.notifyUserList(e)},0),!0},fIM_onGetUserInfo:function(e,i){return t.Log("nTalk.fIM_onGetUserInfo("+t.JSON.toJSONString(e)+", "+i+")",1),setTimeout(function(){var s=t.chatManage.get(i);s&&s._userInfo(e)},0),!0},fIM_notifyUserEnter:function(e,i,s,n){return t.Log("nTalk.fIM_notifyUserEnter("+e+", "+i+")"),setTimeout(function(){var e=t.chatManage.get(n);e&&(e.userEnter(i),e._userInfo(i))},0),!0},fIM_notifyUserLeave:function(e,i){return setTimeout(function(){var s=t.chatManage.get(i);s&&s.userLeave(e)},0),!0},fIM_receiveMessage:function(e,i){setTimeout(function(){var s=t.chatManage.get(i);s&&s.receive(e)},0)},fIM_eduWapReceiveMessage:function(e,i){setTimeout(function(){var s=t.chatManage.get(i);s&&s.eduWapAutoView&&s.eduWapAutoView.showMessage(e)},0)},fIM_suggestMessage:function(e,i){setTimeout(function(){var s=t.chatManage.get(i);s&&s.suggest(e)},0)},fIM_onGetFlashServer:function(t,e,i,s,n,a,o){},fIM_setTChatGoServer:function(e,i){t.Log("nTalk.fIM_setTChatGoServer("+e+")"),setTimeout(function(){var s=t.chatManage.get(i);s&&s.setFlashGoServer(e)},0)},fIM_updateUserNumber:function(){},fIM_callStat:function(e,i,s){t.global&&!t.global.callStatCount&&(t.global.callStatCount=new Object,t.global.callStatCount.success=0,t.global.callStatCount.failure=0),"mqtt"==e&&"success"==s&&0==t.global.callStatCount.success?(t.chatManage.get(i).callStat("16"),t.global.callStatCount.success=1):"mqtt"==e&&"failure"==s&&0==t.global.callStatCount.failure?(t.chatManage.get(i).callStat("17"),t.global.callStatCount.failure=1):"flash"==e&&"success"==s&&0==t.global.callStatCount.success?(t.chatManage.get(i).callStat("14"),t.global.callStatCount.success=1):"flash"==e&&"failure"==s&&0==t.global.callStatCount.failure?(t.chatManage.get(i).callStat("15"),t.global.callStatCount.failure=1):t.log("fIM_callStat: error;")}}),t.extend({fIM_uploadFlashReady:function(e,i,s){return setTimeout(function(){var e=t.chatManage.get(s);e?e._uploadReady(i):t.Log("nTalk.uploadFlashReady()",3)},0),!0},fIM_startSendFile:function(e,i,s,n){var a=t.chatManage.get(n);return t.Log("nTalk.fIM_startSendFile("+i+","+s+", "+n+")"),setTimeout(function(){a.startUpload(i,s)},0),!0},fIM_receiveUploadSuccess:function(e,i,s,n){var a=t.chatManage.get(n);t.Log("nTalk.fIM_receiveUploadSuccess("+t.JSON.toJSONString(arguments)+")"),setTimeout(function(){a.uploadSuccess(i,s)},0)},fIM_receiveUploadFailure:function(e,i,s,n){var a=t.chatManage.get(n);t.Log("nTalk.fIM_receiveUploadFailure("+t.JSON.toJSONString(arguments)+")"),setTimeout(function(){a.uploadFailure(i,s)},0)},fIM_receiveUploadProgress:function(e,i,s,n){var a=t.chatManage.get(n);return setTimeout(function(){a.uploadProgress(i,s)},0),!0}}),t.extend({clearSessionCache:function(){var e,i=this;if(t.base&&t.base.clearChatCache){try{e=t.store.getAll()}catch(e){t.Log("$.store:"+typeof t.store,3)}e&&(t.each(e,function(e){e.toString().indexOf(t.base.CON_LOCAL_FIX)>-1&&i.store.remove(e)}),t.Log("clear chat cache"))}else t.Log("no clear chat cache")},sendErpNews:function(){var e="",i="",s="",n="";t.global.trailGetRegion&&(t.global.trailGetRegion.ip&&(e=t.global.trailGetRegion.ip),t.global.trailGetRegion.country&&(i=t.global.trailGetRegion.country),t.global.trailGetRegion.province&&(s=t.global.trailGetRegion.province),t.global.trailGetRegion.city&&(n=t.global.trailGetRegion.city)),t.waitMessage.verificationAdd(t.getTime(1),{type:5,msg:{msgtype:7,param:t.global.erpparam+"|lang="+(t.global.lang||t.language)+'|{"ip":"'+e+'","country":"'+i+'","province":"'+s+'","city":"'+n+'"}'}})},chatReady:function(){var e=this;this.trailGetRegionCount=0,t.waitMessage||(t.waitMessage=new t.HASH,t.waitMessage.verificationAdd=function(t,e){var i=!1;this.each(function(t,s){s.type==e.type&&s.msg.msgtype==e.msg.msgtype&&(i=!0)}),i||this.add(t,e)}),t.waitMessage.verificationAdd(t.getTime(1),{type:5,msg:{msgtype:2,parentpagetitle:(t.global.title||t.title).toString().substr(0,32),parentpageurl:t.global.source||t.source,userlevel:t.global.isvip,sences:""}}),t.global.trailGetRegion&&t.global.trailGetRegion.success&&1==t.global.trailGetRegion.success?this.sendErpNews():this.trailGetRegionTimer=setInterval(function(){e.trailGetRegionCount++,(t.global.trailGetRegion&&1==t.global.trailGetRegion.success||e.trailGetRegionCount>=4)&&(e.sendErpNews(),clearInterval(e.trailGetRegionTimer),e.trailGetRegionCount=0)},500),t.Log("$.chatReady():: $.waitMessage.count():"+t.waitMessage.count(),1),!t.themesURI&&t.browser.mobile?(t.imageicon=t.sourceURI+"images/mobileicon.png",t.rengong=t.sourceURI+"images/rengong.png"):t.themesURI||(t.imageicon=t.sourceURI+"images/chaticon."+(t.browser.msie6?"gif":"png"),t.imagebg=t.sourceURI+"images/chatbg.gif"),t.imagesingle=t.sourceURI+"images/single.png",t.imagemultiplayer=t.sourceURI+"images/multiplayer.png",t.button=t.sourceURI+"images/button.png",t.button2=t.sourceURI+"images/button2.png",t.require([t.imageicon],function(e){e.error&&t.Log("cache chat icon failure",3)}),t.clearSessionCache()}}),t.chatReady()}(nTalk);