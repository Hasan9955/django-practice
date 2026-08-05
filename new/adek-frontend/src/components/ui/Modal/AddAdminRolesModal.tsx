"use client";

import { useState } from "react";
import { Modal, Button, Form, Input, Select, Upload, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";

const { Option } = Select;

interface FormData {
	role: string;
	fullName: string;
	email: string;
	password: string;
}

interface ProfileModalProps {
	open: boolean;
	onClose: () => void;
	onSuccess?: (data: FormData & { profileImage: File | null }) => void;
}

const ProfileModal = ({ open, onClose, onSuccess }: ProfileModalProps) => {
	const [form] = Form.useForm();
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [loading, setLoading] = useState(false);

	const handleOk = async () => {
		try {
			setLoading(true);
			const values: FormData = await form.validateFields();

			const formData = {
				...values,
				profileImage: fileList[0]?.originFileObj || null,
			};

			console.log("Form submitted:", formData);

			// Call the success callback if provided
			if (onSuccess) {
				onSuccess(formData);
			}

			message.success("Profile added successfully!");
			handleClose();
		} catch (errorInfo) {
			console.log("Validation failed:", errorInfo);
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		form.resetFields();
		setFileList([]);
		onClose();
	};

	const handleUploadChange: UploadProps["onChange"] = ({
		fileList: newFileList,
	}) => {
		setFileList(newFileList);
	};

	const beforeUpload = (file: File) => {
		const isImage = file.type.startsWith("image/");
		if (!isImage) {
			message.error("You can only upload image files!");
			return false;
		}
		const isLt2M = file.size / 1024 / 1024 < 2;
		if (!isLt2M) {
			message.error("Image must be smaller than 2MB!");
			return false;
		}
		return false; // Prevent auto upload
	};

	const uploadButton = (
		<div
			style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
		>
			<PlusOutlined style={{ fontSize: "24px", color: "#d9d9d9" }} />
		</div>
	);

	return (
		<Modal
			title="Profile"
			open={open}
			onCancel={handleClose}
			footer={null}
			width={700}
			styles={{
				header: { paddingBottom: "16px" },
				body: { paddingTop: "0px" },
			}}
			destroyOnHidden={true}
		>
			<Form
				form={form}
				layout="vertical"
				onFinish={handleOk}
				style={{ marginTop: "20px" }}
			>
				{/* Profile Image Upload */}
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						marginBottom: "24px",
					}}
				>
					<Upload
						listType="picture-circle"
						fileList={fileList}
						onChange={handleUploadChange}
						beforeUpload={beforeUpload}
						maxCount={1}
						showUploadList={{
							showPreviewIcon: false,
							showRemoveIcon: true,
						}}
						style={{
							width: "96px",
							height: "96px",
						}}
					>
						{fileList.length >= 1 ? null : uploadButton}
					</Upload>
				</div>

				{/* Role Selection */}
				<Form.Item
					label="Role"
					name="role"
					rules={[{ required: true, message: "Please select a role!" }]}
					style={{ marginBottom: "20px" }}
				>
					<Select placeholder="Finance" size="large">
						<Option value="finance">Finance</Option>
						<Option value="marketing">Marketing</Option>
						<Option value="engineering">Engineering</Option>
						<Option value="sales">Sales</Option>
						<Option value="hr">Human Resources</Option>
						<Option value="support">Support</Option>
					</Select>
				</Form.Item>

				{/* Full Name */}
				<Form.Item
					label="Full name"
					name="fullName"
					rules={[{ required: true, message: "Please enter your full name!" }]}
					style={{ marginBottom: "20px" }}
				>
					<Input placeholder="Enter your full name" size="large" />
				</Form.Item>

				{/* Email */}
				<Form.Item
					label="Email"
					name="email"
					rules={[
						{ required: true, message: "Please enter your email!" },
						{ type: "email", message: "Please enter a valid email!" },
					]}
					style={{ marginBottom: "20px" }}
				>
					<Input placeholder="Enter your email" size="large" />
				</Form.Item>

				{/* Password */}
				<Form.Item
					label="Password"
					name="password"
					rules={[{ required: true, message: "Please enter your password!" }]}
					style={{ marginBottom: "24px" }}
				>
					<Input.Password placeholder="Enter your password" size="large" />
				</Form.Item>

				{/* Submit Button */}
				<Form.Item style={{ marginBottom: "0px" }}>
					<Button
						type="primary"
						htmlType="submit"
						size="large"
						block
						loading={loading}
						style={{
							backgroundColor: "#1677ff",
							borderColor: "#1677ff",
							height: "44px",
							fontSize: "16px",
							fontWeight: "500",
						}}
					>
						Add now
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default ProfileModal;
