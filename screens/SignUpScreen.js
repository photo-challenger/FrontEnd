import React, { useState, useEffect } from 'react';
import { TextInput, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, Text, Modal, View, Image, ActivityIndicator } from 'react-native';
import ImagePickerItem from '../component/common/ImagePickerItem';
import Animated from 'react-native-reanimated';
import styled from 'styled-components/native';
import {
	fetchSignUp,
	fetchEmailAuthSend,
	fetchEmailAuthCheck,
} from '../service/api';
import useAlert from '../hooks/useAlert';

const SignUpScreen = ({ route, navigation }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [userNickname, setUserNickname] = useState('');
	const [userEmail, setUserEmail] = useState('');
	const [emailAuthNum, setEmailAuthNum] = useState('');
	const [userPassword, setUserPassword] = useState('');
	const [checkUserPassword, setCheckUserPassword] = useState('');

	const [emailIsValid, setEmailIsValid] = useState();
	const [emailValidText, setEmailValidText] = useState();
	const [nicknameIsValid, setNicknameIsValid] = useState();
	const [emailAuthNumIsValid, setEmailAuthNumIsValid] = useState();
	const [passwordIsValid, setPasswordIsValid] = useState();
	const [checkPasswordIsValid, setCheckPasswordIsValid] = useState();
	const [imageInfo, setImageInfo] = useState('');
	const [showAlert, AlertComponent] = useAlert();

	const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
	useEffect(() => {
		if (userEmail !== '') {
			if (emailRegex.test(userEmail)) {
				setEmailIsValid(true);
			} else {
				setEmailValidText("이메일 형식이 맞지 않습니다.");
				setEmailIsValid(false);
			}
		}
	}, [userEmail]);

	useEffect(() => {
		if (checkUserPassword !== '') {
			setCheckPasswordIsValid(userPassword === checkUserPassword);
		}
	}, [checkUserPassword]);

	const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;
	useEffect(() => {
		if (userPassword !== '') {
			setPasswordIsValid(passwordRegex.test(userPassword));
		}
	}, [userPassword]);

	const handleSignUpFetch = async () => {
		if (!emailIsValid || !userNickname || !passwordIsValid || !emailAuthNumIsValid) {
			showAlert({
				title: "회원가입 오류",
				msg: "회원가입에 필요한 모든 내용을\n 양식에 맞춰 작성해 주세요!",
			});
			return;
		}

		const formData = new FormData();

		formData.append('loginEmail', userEmail);
		formData.append('loginPw', userPassword);
		formData.append('nickname', userNickname);
		formData.append('loginType', 'SELF');

		if(imageInfo) {
			formData.append('file', imageInfo);
		}
		formData.append('emailAuthCheck', emailAuthNumIsValid);

		const response = await fetchSignUp(formData);

		if (response === 'User register success') {
			showAlert({
				title: "회원가입 성공!",
				msg: <Text><Text color={"#CA7FFE"}>tripture</Text>의 회원이 되신 것을 환영합니다.</Text>,
				onOk: async function () {
					navigation.navigate('LoginScreen');
				}
			});
		} else {
			showAlert({
				title: "회원가입 오류",
				msg: response,
			});
		}
	}

	const handleEmailAuthSend = async () => {
		if (emailIsValid && userEmail) {
			setIsLoading(true);
			const response = await fetchEmailAuthSend(userEmail);

			if (response) {
				showAlert({
					title: "인증번호 전송 완료",
					msg: "회원님의 이메일로 인증번호가 전송되었습니다.",
				});
			}
			setIsLoading(false);
		} else {
			showAlert({
				title: "이메일 형식을 확인해 주세요.",
				msg: "ex) username@example.com",
			});
		}
	}

	const handleEmailAuthCheck = async () => {
		if (emailAuthNum) {
			setIsLoading(true);
			const response = await fetchEmailAuthCheck(userEmail, emailAuthNum);

			if (response === 'true') {
				setEmailAuthNumIsValid(true);
			} else {
				showAlert({
					title: "이메일 인증 오류",
					msg: response,
				});
			}
			setIsLoading(false);
		} else {
			showAlert({
				title: "인증번호를 입력해 주세요.",
				msg: "이메일로 발송해 드린 인증번호를 확인해 주세요.",
			});
		}
	}

	function setImageResult(rs) {
		const file = {
			uri: rs.assets[0].uri,
			type: 'image/jpeg',
			name: rs.assets[0].fileName || rs.assets[0].uri.split('/').pop(),
		};
		setImageInfo(file);
	}

	return (
		<SignUpContainer>
			{isLoading && (
				<LoadingContainer>
					<ActivityIndicator size="large" color="#CA7FFE" />
				</LoadingContainer>
			)}
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.keyboardAvoidingView}
			>
				<Animated.View
					style={[styles.animatedSheet]}
				>
					<Animated.ScrollView
						style={styles.scrollView}
						contentContainerStyle={styles.scrollViewContent}
						keyboardShouldPersistTaps="always"
					>
						<SignUpHeaderText>트립처와 함께{'\n'}추억을 붙잡아볼까요?</SignUpHeaderText>

						<ImagePickerItem callbackResult={setImageResult} borderType={'circle'} />
						<View style={{ marginBottom: 26 }} />

						<SignUpInputContainer>
							<InputLabelText>닉네임</InputLabelText>
							<NicknameInputContent nicknameIsValid={nicknameIsValid}>
								<TextInput
									placeholder="어떤 이름을 사용하시겠어요?"
									placeholderTextColor={"#5F5F5F"}
									onChangeText={(text) => setUserNickname(text)}
								/>
								{nicknameIsValid !== undefined && nicknameIsValid !== null ? (
									nicknameIsValid ? (
										<InputImage source={require('../assets/signUp-check-icon.png')} />
									) : (
										<InputImage source={require('../assets/signUp-warning-icon.png')} />
									)
								) : null}
							</NicknameInputContent>
							{nicknameIsValid !== undefined && nicknameIsValid !== null ? (
								nicknameIsValid ? (null) : (
									<EmailNotValidText>중복된 닉네임입니다.</EmailNotValidText>
								)) : null}
						</SignUpInputContainer>

						<SignUpInputContainer>
							<InputLabelText>이메일</InputLabelText>
							<EmailAuthContainer>
								<EmailInputContent emailIsValid={emailIsValid}>
									<TextInput
										placeholder="이메일을 입력해주세요."
										placeholderTextColor={"#5F5F5F"}
										onChangeText={(text) => setUserEmail(text)}
									/>
									{emailIsValid !== undefined && emailIsValid !== null ? (
										emailIsValid ? (
											<InputImage source={require('../assets/signUp-check-icon.png')} />
										) : (
											<InputImage source={require('../assets/signUp-warning-icon.png')} />
										)
									) : null}
								</EmailInputContent>
								<EmailButton activeOpacity={0.6} onPress={handleEmailAuthSend}>
									<EmailButtonText>인증 받기</EmailButtonText>
								</EmailButton>
							</EmailAuthContainer>
							{emailIsValid !== undefined && emailIsValid !== null ? (
								emailIsValid ? (null) : (
									<EmailNotValidText>{emailValidText}</EmailNotValidText>
								)) : null}
						</SignUpInputContainer>

						<SignUpInputContainer>
							<InputLabelText>인증번호</InputLabelText>
							<EmailAuthContainer>
								<EmailAuthInputContent emailAuthNumIsValid={emailAuthNumIsValid}>
									<TextInput
										placeholder="인증번호를 입력해주세요."
										placeholderTextColor={"#5F5F5F"}
										onChangeText={(text) => setEmailAuthNum(text)}
									/>
									{emailAuthNumIsValid !== undefined && emailAuthNumIsValid !== null ? (
										emailAuthNumIsValid ? (
											<InputImage source={require('../assets/signUp-check-icon.png')} />
										) : (
											<InputImage source={require('../assets/signUp-warning-icon.png')} />
										)
									) : null}
								</EmailAuthInputContent>
								<EmailButton activeOpacity={0.6} onPress={handleEmailAuthCheck}>
									<EmailButtonText>인증 확인</EmailButtonText>
								</EmailButton>
							</EmailAuthContainer>
							{emailAuthNumIsValid !== undefined && emailAuthNumIsValid !== null ? (
								emailAuthNumIsValid ? (null) : (
									<EmailNotValidText>인증번호가 맞지 않습니다.</EmailNotValidText>
								)) : null}
						</SignUpInputContainer>

						<SignUpInputContainer>
							<InputLabelText>비밀번호</InputLabelText>
							<PasswordInputContent passwordIsValid={passwordIsValid}>
								<TextInput
									placeholder="특수문자, 숫자 포함 8자 이상 입력해주세요."
									placeholderTextColor={"#5F5F5F"}
									onChangeText={(text) => setUserPassword(text)}
									secureTextEntry={true}
								/>
								{passwordIsValid !== undefined && passwordIsValid !== null ? (
									passwordIsValid ? (
										<InputImage source={require('../assets/signUp-check-icon.png')} />
									) : (
										<InputImage source={require('../assets/signUp-warning-icon.png')} />
									)
								) : null}
							</PasswordInputContent>
							{passwordIsValid !== undefined && passwordIsValid !== null ? (
								passwordIsValid ? (null) : (
									<EmailNotValidText>비밀번호 형식이 맞지 않습니다.</EmailNotValidText>
								)) : null}
						</SignUpInputContainer>

						<SignUpInputContainer>
							<InputLabelText>비밀번호 확인</InputLabelText>
							<CheckPasswordInputContent checkPasswordIsValid={checkPasswordIsValid}>
								<TextInput
									placeholder="비밀번호를 다시 한 번 입력해주세요."
									placeholderTextColor={"#5F5F5F"}
									onChangeText={(text) => setCheckUserPassword(text)}
									secureTextEntry={true}
								/>
								{checkPasswordIsValid !== undefined && checkPasswordIsValid !== null ? (
									checkPasswordIsValid ? (
										<InputImage source={require('../assets/signUp-check-icon.png')} />
									) : (
										<InputImage source={require('../assets/signUp-warning-icon.png')} />
									)
								) : null}
							</CheckPasswordInputContent>
							{checkPasswordIsValid !== undefined && checkPasswordIsValid !== null ? (
								checkPasswordIsValid ? (null) : (
									<EmailNotValidText>비밀번호가 같지 않습니다.</EmailNotValidText>
								)) : null}
						</SignUpInputContainer>

						<SignUpButton activeOpacity={0.6} onPress={handleSignUpFetch}>
							<SignUpButtonText>가입하기</SignUpButtonText>
						</SignUpButton>

						<AlertComponent />
					</Animated.ScrollView>
				</Animated.View>
			</KeyboardAvoidingView>
		</SignUpContainer >
	);
};

export default SignUpScreen;

const styles = StyleSheet.create({
	keyboardAvoidingView: {
		flex: 1,
		backgroundColor: 'transparent',
	},
	animatedSheet: {
		backgroundColor: 'white',
		maxHeight: '100%',
	},
	scrollView: {
		flexGrow: 1, // Changed from flex: 1
		backgroundColor: 'transparent',
	},
	scrollViewContent: {
		flexGrow: 1,
		backgroundColor: 'transparent',
	}
});

const LoadingContainer = styled.View`
	position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  justify-content: center;
  align-items: center;
  z-index: 2;
`

const SignUpContainer = styled.View`
  background: #fff;
  padding: 20px;
  height: 100%;
`;

const SignUpHeaderText = styled.Text`
	font-size: 24px;
	font-style: normal;
	font-weight: 500;
	margin-bottom: 26px;
`

const SignUpInputContainer = styled.View`
	margin-bottom: 40px;
`

const InputLabelText = styled.Text`
	margin-bottom: 4px;
	font-size: 18px;
	font-style: normal;
	font-weight: 600;
	color: #5F5F5F;
`

const InputImage = styled.Image`
	width: 16px;
	height: 16px;
`

const NicknameInputContent = styled.View`
  display: flex;
  height: 40px;
  background: #FFFFFF;
  flex-direction: row;
	border-bottom-width: 1px;
	border-bottom-color: ${(props) =>
		props.nicknameIsValid === undefined || props.nicknameIsValid === null ? "#DEDEDE" : props.nicknameIsValid ? "#0046B8" : "#CB1400"};
	flex: 1;
	align-items: center;
	justify-content: space-between;
`;

const EmailInputContent = styled.View`
  display: flex;
  height: 40px;
  background: #FFFFFF;
  flex-direction: row;
	border-bottom-width: 1px;
	border-bottom-color: ${(props) =>
		props.emailIsValid === undefined || props.emailIsValid === null ? "#DEDEDE" : props.emailIsValid ? "#0046B8" : "#CB1400"};
	flex: 1;
	align-items: center;
	justify-content: space-between;
`;

const EmailNotValidText = styled.Text`
	font-size: 12px;
	font-style: normal;
	font-weight: 400;
	color: #CB1400;
	margin-top: 4px;
`

const EmailAuthInputContent = styled.View`
  display: flex;
  height: 40px;
  background: #FFFFFF;
  flex-direction: row;
	border-bottom-width: 1px;
	border-bottom-color: ${(props) =>
		props.emailAuthNumIsValid === undefined || props.emailAuthNumIsValid === null ? "#DEDEDE" : props.emailAuthNumIsValid ? "#0046B8" : "#CB1400"};
	flex: 1;
	align-items: center;
	justify-content: space-between;
`;

const PasswordInputContent = styled.View`
  display: flex;
  height: 40px;
  background: #FFFFFF;
  flex-direction: row;
	border-bottom-width: 1px;
	border-bottom-color: ${(props) =>
		props.passwordIsValid === undefined || props.passwordIsValid === null ? "#DEDEDE" : props.passwordIsValid ? "#0046B8" : "#CB1400"};
	flex: 1;
	align-items: center;
	justify-content: space-between;
`;

const CheckPasswordInputContent = styled.View`
  display: flex;
  height: 40px;
  background: #FFFFFF;
  flex-direction: row;
	border-bottom-width: 1px;
	border-bottom-color: ${(props) =>
		props.checkPasswordIsValid === undefined || props.checkPasswordIsValid === null ? "#DEDEDE" : props.checkPasswordIsValid ? "#0046B8" : "#CB1400"};
	flex: 1;
	align-items: center;
	justify-content: space-between;
`;

const EmailAuthContainer = styled.View`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
`

const EmailButton = styled.TouchableOpacity`
	width: 88px;
	height: 40px;
	background-color: #F2F3F7;
	align-items: center;
	justify-content: center;
	border-radius: 8px;
	margin-left: 16px;
`

const EmailButtonText = styled.Text`
	font-size: 14px;
	font-style: normal;
	font-weight: 600;
	color: #999999;
	line-height: 40px;
`

const SignUpButton = styled.TouchableOpacity`
	height: 40px;
	width: 100%;
	background-color: #4F4F4F;
	border-radius: 8px;
	align-items: center;
	justify-content: center;
`

const SignUpButtonText = styled.Text`
	font-size: 14px;
	font-style: normal;
	font-weight: 600;
	color: #FFFFFF;
	line-height: 40px;
`