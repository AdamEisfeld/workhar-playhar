import { defineExtractions } from "../../src/mustachr";

export default defineExtractions([
	{
		"type": "string",
		"property": "TOKENTS",
		"search": "Foo",
		"replace": "{{ property }}"
	}
]);
