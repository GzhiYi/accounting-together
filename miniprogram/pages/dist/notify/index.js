import { VantComponent } from '../common/component';
import { RED } from '../common/color';
VantComponent({
  props: {
    text: String,
    color: {
      type: String,
      value: '#fff'
    },
    backgroundColor: {
      type: String,
      value: RED
    },
    duration: {
      type: Number,
      value: 3000
    }
  },
  methods: {
    show: function show() {
      var _this = this;

      var duration = this.data.duration;
      clearTimeout(this.timer);
      this.set({
        show: true
      });

      if (duration > 0 && duration !== Infinity) {
        this.timer = setTimeout(function () {
          _this.hide();
        }, duration);
      }
    },
    hide: function hide() {
      clearTimeout(this.timer);
      this.set({
        show: false
      });
    }
  }
});