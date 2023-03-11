// set the link to the model server for image prediction
let serverUrl = 'http://127.0.0.1:5000'
let modelUrl = serverUrl+'/predict'
let emailUrl = serverUrl+'/send-mail'


const checkImages = async (images, baseUrl) => {
	try {
		if (!images.length) return;

		let mainResp = [];

		let counter = 0;

		while (images && images.length) {
			counter++;
			const splicedArr = images.splice(0, 30);
			let promiseArr = [];
			splicedArr.forEach((image) => {
				promiseArr.push(
					fetch(`${baseUrl}`, {
						method: 'POST',
						// url: `${baseUrl}?lnk=${btoa(image)}`,
						body: new URLSearchParams(`lnk=${btoa(image)}`),
						headers: {
							'Access-Control-Allow-Origin': '*',
							// 'Access-Control-Allow-Methods': 'GET'
							'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
							'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'

						}
					})
				);
			});

			let resp = await Promise.allSettled(promiseArr);
			promiseArr = [];

			resp.map((item) => item.status === 'fulfilled');
			resp.forEach((item) => {
				promiseArr.push(item.value.json());
			});

			resp = await Promise.all(promiseArr);
			// console.log(resp);
			mainResp = [ ...mainResp, ...resp ];
		}

		return mainResp.map((item) => item);
	} catch (error) {
		console.error('Error in checkImages :: ', error);
		return [];
	}
};

const createTextEl = () => {
	const text = document.createElement('div');
	text.textContent = 'Un-processed image';
	text.style.position = 'absolute';
	text.style.top = '50%';
	text.style.left = '50%';
	text.style.transform = 'translate(-50%, -50%)';

	return text;
};

const handler = async (baseUrl) => {
	try {
		// console.log('Here');
		attached = true;
		const imageArr = [];
		const images = document.querySelectorAll('img');
		images.forEach((image) => {
			if(!image.src == '') {
				imageArr.push(image.src)
				// console.log(modelUrl+'?lnk='+btoa(image.src));
			}
		});
		
	

		if (!imageArr.length) {
			document.body.style.filter = 'blur(0)';
			return;
		}
		
		// let resp = ''

		// if(imageArr.length > 5) {
		// 	 resp = await checkImages(imageArr.splice(0,5), baseUrl);
		// }else{
		// 	 resp = await checkImages(imageArr, baseUrl);

		// }

		const resp = await checkImages(imageArr, baseUrl);

		console.log('Main response : ', resp);

		if (!resp.length) {
			document.body.style.filter = 'blur(0)';
			return;
		}

		const blurImages = [];
		const unProcessedImages = [];
		resp.forEach((item, index) => {
			if (item.isBlur === 1) {
				blurImages.push({ url: item.url, index: index });
			} else if (item.isBlur === 2) {
				unProcessedImages.push({ url: item.url, index: index });
			}
		});

		console.log('BlurredImages:: ', blurImages);
		// console.log('Unprocessed Images :: ', unProcessedImages);
		if (!blurImages.length) {
			document.body.style.filter = 'blur(0)';
			return;
		}

		blurImages.forEach((item) => {
			// console.log(images[item.index]);
			const i = images[item.index];
			i.style.filter = 'blur(1.5rem)';
			// i.onclick = () => {
			// 	i.style.filter = 'blur(0)';
			// };
		});

		unProcessedImages.forEach((item) => {
			const i = images[item.index];
			const text = createTextEl();
			i.appendChild(text);
			i.style.filter = 'grayscale(100%) blur(1.5rem)';
			// i.onclick = () => {
			// 	i.style.filter = 'grayscale(0%) blur(0)';
			// 	i.removeChild(text);
			// };
		});

		document.body.style.filter = 'blur(0)';

		return;
	} catch (error) {
		document.body.style.filter = 'blur(0)';
		console.log(error);
		return;
	}
};


setTimeout(async () => {
	chrome.storage.sync.get([ 'isExtensionOn' ], async function(items) {
		// if extension is not turned on then don't blur anything
		if(!items.isExtensionOn) return;

		document.body.style.filter = 'blur(1.5rem)';
		await handler(modelUrl);
	});
}, 1000);
