import { useEffect, useState } from "react";
import { Card, Col, Row, Input, Button, Empty } from "@douyinfe/semi-ui";
import "./App.css";
import { load, type SpaceVo } from "./space";

const chunk = (arr: Array<SpaceVo>, size: number): Array<Array<SpaceVo>> => {
  const ret = [];
  for (let i = 0; i < arr.length; i = i + size) {
    ret.push([...arr.slice(i, i + size)]);
  }
  return ret;
};

type Pack = {
  name: string;
  physicsPath: string;
};

function App() {
  const [spaces, setSpaces] = useState<Array<SpaceVo>>([]);
  const [editing, setEditing] = useState<string>();
  const [creating, setCreating] = useState<boolean>(false);
  const [pack, setPack] = useState<Pack>({ name: "", physicsPath: "" });

  async function init() {
    const spaces = await load();
    setSpaces(spaces);
  }

  const doCreate = async () => {
    await fetch(`api/space`, {
      method: "post",
      body: JSON.stringify(pack),
      headers: {
        "content-type": "application/json",
      },
    });
    setPack({ name: "", physicsPath: "" });
    setCreating(false);
    await init();
  };

  const save = async (ele: SpaceVo) => {
    await fetch(`api/space/${ele.id}`, {
      method: "put",
      body: JSON.stringify(ele),
      headers: {
        "content-type": "application/json",
      },
    });
    await init();
  };

  const handleChange = (id: string) => (eventValue: string) => {
    setSpaces(
      spaces.map((space) => {
        if (space.id === id) {
          return { ...space, physicsPath: eventValue };
        }
        return space;
      })
    );
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="App" style={{ width: 1280 }}>
      {spaces.length > 0 ? (
        chunk(spaces, 4).map((rows, rowIndex) => {
          return (
            <Row key={`row-${rowIndex}`} gutter={[8, 8]}>
              {rows.map((ele) => {
                return (
                  <Col
                    span={6}
                    style={{ maxWidth: 720 }}
                    key={`wrapper-${ele.id}`}
                  >
                    <Card
                      bordered={true}
                      headerLine={true}
                      title={ele.name}
                      key={`card-${ele.id}`}
                    >
                      <Input
                        value={ele.physicsPath}
                        onFocus={() => {
                          setEditing(ele.id);
                        }}
                        onChange={handleChange(ele.id)}
                      ></Input>
                      <Row gutter={[8, 8]} style={{ marginTop: 16 }}>
                        <Col span={12}>
                          <Button>view</Button>
                        </Col>
                        {editing === ele.id && (
                          <Col span={12}>
                            <Button onClick={() => save(ele)}>save</Button>
                          </Col>
                        )}
                      </Row>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          );
        })
      ) : (
        <div>
          <Empty title={"没有空间数据"} description="暂时没有任何的空间" />
          <div style={{ margin: "8px", padding: "6px 24px" }}>
            {creating && (
              <div>
                <Input
                  placeholder="起个名字吧"
                  value={pack.name}
                  onChange={(value) => setPack({ ...pack, name: value })}
                ></Input>
                <Input
                  style={{ marginTop: "8px" }}
                  placeholder="输入物理路径"
                  value={pack.physicsPath}
                  onChange={(value) => setPack({ ...pack, physicsPath: value })}
                ></Input>
                <Button
                  style={{ margin: "8px", padding: "6px 24px" }}
                  theme="solid"
                  type="primary"
                  onClick={() => {
                    doCreate();
                  }}
                >
                  保存
                </Button>
              </div>
            )}
            {!creating && (
              <Button
                disabled={creating}
                style={{ margin: "8px", padding: "6px 24px" }}
                theme="solid"
                type="primary"
                onClick={() => {
                  setCreating(true);
                }}
              >
                新建一个
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
