// components/avatar/avatar.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        userInfo: Object,
        size: {
					type: String,
					value: '80'
        },
        className: {
					type: String,
					value: 'rounded-full'
				},
				showLabel: {
					type: Boolean,
					value: true
				}
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {

    }
})
