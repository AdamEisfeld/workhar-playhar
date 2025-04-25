import { defineExtractions } from "../../src/mustachr";

export default defineExtractions([
	{
		"type": "string",
		"property": "TOKENJS",
		"search": "Foo",
		"replace": "{{ property }}"
	}
]);
