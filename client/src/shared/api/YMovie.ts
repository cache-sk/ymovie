namespace ymovie.api.YMovie {
	export class Api {
		static ENDPOINT = "";

		constructor() {}

		async pair(token:string, deviceId:string):Promise<boolean> {
			const url = `/api/v1/pair/${deviceId}`;
			const response = await fetch(url, {method:"PUT", body:token});
			console.log(response.status);
			return response.ok;
		}
	}
}
