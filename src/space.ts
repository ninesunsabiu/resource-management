export type SpaceVo = {
  id: string;
  name: string;
  physicsPath: string;
};

export const load = async (): Promise<Array<SpaceVo>> => {
  const resp = await fetch("api/space", {
    method: "get",
  });
  const json = await resp.json();
  return json;
};
