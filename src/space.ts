export class ReSpace {
  _id: string;
  name: string;
  physicsPath: string | null;

  constructor(_id: string, name: string, physicsPath: string) {
    this._id = _id;
    this.name = name;
    this.physicsPath = physicsPath;
  }
}

export const load = async (): Promise<Array<ReSpace>> => {
  const resp = await fetch("api/space", {
    method: "get",
  });
  const json = await resp.json();
  return json;
};
