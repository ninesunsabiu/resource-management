import { useEffect, useState } from "react";
import { Card, Col, Row, Input, Button } from "@douyinfe/semi-ui";
import "./App.css";
import { load, ReSpace } from "./space";

const chunk = (arr: Array<ReSpace>, size: number): Array<Array<ReSpace>> => {
  const ret = [];
  for (let i = 0; i < arr.length; i = i + size) {
    ret.push([...arr.slice(i, i + size)]);
  }
  return ret;
};

function App() {
  const [spaces, setSapces] = useState<Array<ReSpace>>([]);
  const [editing, setEditing] = useState<string>();

  async function init() {
    const spaces = await load();
    setSapces(spaces);
  }

  const save = async (ele: ReSpace) => {
    await fetch(`api/space/${ele._id}`, {
      method: "put",
      body: JSON.stringify(ele),
    });
    await init();
  };

  const handleChange = (id: string) => (eventvalue: string) => {
    setSapces(
      spaces.map((space) => {
        if (space._id === id) {
          return { ...space, physicsPath: eventvalue };
        }
        return space;
      })
    );
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="App">
      {chunk(spaces, 4).map((rows, rowIndex) => {
        return (
          <Row key={`row-${rowIndex}`} gutter={[8, 8]}>
            {rows.map((ele) => {
              return (
                <Col
                  span={6}
                  style={{ maxWidth: 720 }}
                  key={`wrapper-${ele._id}`}
                >
                  <Card
                    bordered={true}
                    headerLine={true}
                    title={ele.name}
                    key={`card-${ele._id}`}
                  >
                    <Input
                      value={ele.physicsPath || ""}
                      onFocus={() => {
                        setEditing(ele._id);
                      }}
                      onChange={handleChange(ele._id)}
                    ></Input>
                    <Row gutter={[8, 8]} style={{ marginTop: 16 }}>
                      <Col span={12}>
                        <Button>view</Button>
                      </Col>
                      {editing === ele._id && (
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
      })}
    </div>
  );
}

export default App;
