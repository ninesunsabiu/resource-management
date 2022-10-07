export type ReSpace = {
  _id: string;
  name: string;
  physicsPath: string | null;
}

export const load = async (): Promise<Array<ReSpace>> => {
  const resp = await fetch("api/space", {
    method: "get",
  });
  const json = await resp.json();
  return json;
};
