document.querySelector('script[data-assign-js]').$main.extend("core.component", ["core.html", "app.main"], function(html, appMain) {
	var module = this.module;

	appMain.routes['/about'] = "app.pages.about";

	module.add("app.pages.about", AboutPage);

	function AboutPage(props) {
		this.template = `
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis lobortis odio turpis. Nunc ullamcorper aliquam justo. Sed vestibulum scelerisque purus fringilla dignissim. Morbi varius accumsan hendrerit. Donec egestas ligula sit amet tellus aliquet, quis porttitor nisi fringilla. Proin aliquam, augue a mollis interdum, enim nibh vulputate purus, at auctor risus odio quis erat. Duis dui orci, condimentum eu quam ac, ornare tempus libero.
</p>
<p>Phasellus pretium orci risus, a porttitor dui vehicula at. Curabitur at neque id tortor interdum egestas. Maecenas a mollis mauris. Fusce at ante egestas, gravida erat nec, commodo nulla. Nam eros purus, placerat vel auctor sed, finibus at quam. Vivamus scelerisque, tortor eu dapibus tincidunt, lectus felis efficitur arcu, nec finibus urna felis sit amet nisl. Duis pulvinar ante ac ex semper congue. Nam mattis turpis nec nunc malesuada tempor.
</p>
<p>Praesent vestibulum neque at lectus hendrerit, nec scelerisque arcu egestas. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Morbi ultricies ligula sed nisi rutrum posuere. Duis ullamcorper risus sed purus accumsan congue. Nulla metus metus, suscipit eu odio id, tristique commodo lacus. Praesent quis arcu sed quam facilisis efficitur. Nam suscipit tortor vitae risus ornare, non dignissim massa accumsan. Proin bibendum bibendum libero sed iaculis. Integer lobortis ultricies odio, id finibus elit rhoncus vel. Mauris lectus dui, dignissim ut augue quis, iaculis imperdiet nunc. In feugiat enim eu dictum luctus. Pellentesque nulla neque, mattis ut commodo ac, tristique sed lorem.
</p>
<p>Donec a finibus nisi, nec volutpat est. Nullam feugiat libero at gravida dictum. Praesent sagittis, elit vel interdum aliquam, quam nunc eleifend dolor, at maximus felis ex ac libero. Aliquam erat volutpat. Phasellus ac sagittis quam, non tincidunt magna. Pellentesque id libero libero. Sed et dui at libero volutpat aliquet non id eros. Proin at vehicula quam.
</p>
		`;
	}
});