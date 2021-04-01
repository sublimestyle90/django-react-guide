import {parseDataType} from "../helper";

const BASE_URL = 'http://localhost:5000';

export class RestAPI {
    static async get(path: string): Promise<any> {
        const response = fetch(`${BASE_URL}/${path}`);
        const json = response.then((res) => res.json());
        return new Promise((resolve) => {
           json.then(res => {
               resolve(parseDataType(res));
           })
        });

    }
}
