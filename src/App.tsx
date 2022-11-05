import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Col, Row, Input, Button, Empty, Toast } from "@douyinfe/semi-ui";
import "./App.css";
import { load, type SpaceVo } from "./space";

const chunk = (arr: Array<SpaceVo>, size: number): Array<Array<SpaceVo>> => {
  const ret = [];
  for (let i = 0; i < arr.length; i = i + size) {
    ret.push([...arr.slice(i, i + size)]);
  }
  return ret;
};

const filterMapWhenResponseOk = (res: Response) => {
  if (res.ok) {
    return res.json()
  } else {
    return Promise.reject(new Error("接口响应失败"))
  }
}

const noop = (): void => {}
const constTrue = () => true
const constFalse = () => false 

const useRunOnce = <T extends (...a: any[]) => void>(fn: T) => {
  // 当前版本 trick 用闭包保持fn的值
  const fnRef  = useRef(fn)
  fnRef.current = fn

  return useMemo(
    () => {
      let shouldRun = true
      return (...args: Parameters<T>): void => {
        if (shouldRun) {
          shouldRun = false
          fnRef.current(...args)
        }
      }
    },
    []
  )
}

/**
 * 获得已经定义好的 space 的状态
 */
const useSpaces = () => {
  const [spaces, setSpaces] = useState<Array<SpaceVo>>([]);

  const getLastedSpaces = () => {
    return load().then(setSpaces)
  }

  const runWhenMount = useRunOnce(() => getLastedSpaces())

  useEffect(() => runWhenMount(), /* run once */ [])

  const [editingId, setEditingId] = useState<string>();

  const modifyInLocal = (id: string) => (fn: (prevData: SpaceVo) => SpaceVo) => {
    setSpaces((it) => it.map(it => it.id === id ? fn(it) : it))
  }

  const updateToServer = (data: SpaceVo) => {
    return fetch(`api/space/${data.id}`, {
      method: "put",
      body: JSON.stringify(data),
      headers: {
        "content-type": "application/json",
      },
    })
      .then(filterMapWhenResponseOk)
      .then(getLastedSpaces)
      .then(constTrue, constFalse)

  }

  return { spaces, getLastedSpaces, modifyInLocal, updateToServer, editingId, setEditingId } 
}

/**
 * 创建 Space 所包含信息类型
 */
type Pack = Pick<SpaceVo, "name" | "physicsPath">;

/**
 * 创建新 space
 */
const useCreatingSpace = () => {
  const empty: Pack = { name: "", physicsPath: "" }
  const [pack, setPack] = useState<Pack | undefined>();

  const startCreating = () => setPack(empty)

  const postToServer = () => {
    return fetch(`api/space`, {
      method: "post",
      body: JSON.stringify(pack),
      headers: {
        "content-type": "application/json",
      },
    })
      .then(filterMapWhenResponseOk)
      .then(() => setPack(undefined))
      .then(constTrue, constFalse)
  }

  return { startCreating, pack, setPack, postToServer }
}

function App() {
  const { spaces, getLastedSpaces, modifyInLocal, updateToServer, editingId, setEditingId } = useSpaces();

  const { startCreating, pack, setPack, postToServer } = useCreatingSpace()

  const doUpdate = (e: SpaceVo) => {
      updateToServer(e)
        .then((ok) => (ok ? noop : Toast.error.bind(Toast))("更新失败"))
  }

  const doCreate = () => {
    postToServer()
      .then((ok) => (ok ? getLastedSpaces : (msg: string) => { Toast.error(msg) })("创建失败"))
  };

  const modifyPhysicsPathOfExistSpace = (id: string) => (eventValue: string) => {
    modifyInLocal(id)((space) => ({ ...space, physicsPath: eventValue }))
  };

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
                          setEditingId(ele.id);
                        }}
                        onChange={modifyPhysicsPathOfExistSpace(ele.id)}
                      ></Input>
                      <Row gutter={[8, 8]} style={{ marginTop: 16 }}>
                        <Col span={12}>
                          <Button>view</Button>
                        </Col>
                        {editingId === ele.id && (
                          <Col span={12}>
                            <Button onClick={() => doUpdate(ele)}>save</Button>
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
            {pack && (
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
                  onClick={doCreate}
                >
                  保存
                </Button>
              </div>
            )}
            {!pack && (
              <Button
                disabled={!!pack}
                style={{ margin: "8px", padding: "6px 24px" }}
                theme="solid"
                type="primary"
                onClick={startCreating}
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
