namespace ymovie.view.base {
	export class DataComponent<TData> extends Component {
		data:TData | undefined;

		update(data:TData):HTMLElement {
			this.data = data;
			return this.render();
		}
	}
}
