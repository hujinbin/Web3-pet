import React, { useEffect, useState } from 'react';
import { Card, Avatar, Button, Input, message, Spin } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
// import { userContract } from '../web3/userContract';

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  // 假设有当前用户名
  const username = '当前用户名';

  useEffect(() => {
    // TODO: 从区块链获取用户信息
    setLoading(true);
    setTimeout(() => {
      setNickname('区块链昵称');
      setAvatarUrl('');
      setLoading(false);
    }, 800);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // await userContract.methods.updateProfile(nickname, avatarUrl).send();
      setEditing(false);
      message.success('保存成功');
    } catch (err: any) {
      message.error('保存失败');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
      <Card style={{ width: 400 }} loading={loading}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <Avatar size={80} src={avatarUrl} icon={<UserOutlined />} />
          <div style={{ marginTop: 16, fontSize: 18, fontWeight: 500 }}>{username}</div>
        </div>
        {editing ? (
          <>
            <Input
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="昵称"
              style={{ marginBottom: 16 }}
            />
            <Input
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              placeholder="头像URL"
              style={{ marginBottom: 16 }}
            />
            <Button type="primary" block onClick={handleSave} loading={loading}>
              保存
            </Button>
            <Button block style={{ marginTop: 8 }} onClick={() => setEditing(false)}>
              取消
            </Button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 16, marginBottom: 8 }}>昵称：{nickname}</div>
            <div style={{ fontSize: 16, marginBottom: 16 }}>头像URL：{avatarUrl || '未设置'}</div>
            <Button icon={<EditOutlined />} block onClick={() => setEditing(true)}>
              编辑资料
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default Profile;
