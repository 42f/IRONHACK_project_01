document.addEventListener('click', async (event) => {
	const target = event.target;
	if (target.dataset.id) {
		const linkId = target.dataset.id;
		try {
			const { data } = await axios.delete(`/settings/library/` + linkId + '/delete');
			document.querySelector('.lib-count').innerHTML = `<b>${data}</b>`;
		} catch (error) {
			console.log(error);
		}
		target.closest('.track-row').remove();
	}
});
