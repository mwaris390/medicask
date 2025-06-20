import AntDesign from "@expo/vector-icons/AntDesign";
import { useFonts } from "expo-font";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Markdown from "react-native-markdown-display";
import useOpenAIChat from "./hook/useOpenAi";
import CameraButton from "./components/camera";
import Toast from "react-native-toast-message";
import { useNetworkState } from "expo-network";
import { useKeyboard } from "@react-native-community/hooks";
const Camera = require("@/assets/icons/camera.png");
const Send = require("@/assets/icons/send.png");

export default function Index() {
  const flatListRef = useRef<FlatList>(null);
  const [loader, setLoader] = useState(false);
  const { sendMessage } = useOpenAIChat();
  const [text, setText] = useState("");
  const [chat, setChat] = useState<
    {
      id: string;
      source: "user" | "ai";
      msg: string;
    }[]
  >([]);
  const [refreshing, setRefreshing] = useState(false);
  const [picBtn, setPicBtn] = useState(false);
  const networkState = useNetworkState();
  const keyboard = useKeyboard();

  function onRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setChat([]);
      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Successfully clear chat.",
        position: "bottom",
      });
    }, 2000);
  }

  async function conversation(
    id: string,
    message: string,
    mode: "text" | "image"
  ) {
    setLoader(true);
    setChat((prevChat) => [
      ...prevChat, // Keep previous messages
      {
        id: id,
        source: "user",
        msg: mode == "text" ? message : "Image Attached",
      }, // Add new message
    ]);
    setText("");
    let reply = "";
    if (networkState.isInternetReachable) {
      reply = await sendMessage(message, chat, mode);
    } else {
      Toast.show({
        type: "error",
        text1: "Sorry!",
        text2: "Something went wrong to with Internet.",
        position: "bottom",
      });
    }
    if (reply) {
      setLoader(false);
      setChat((prev) => [...prev, { id: genId(), source: "ai", msg: reply }]);
      flatListRef.current?.scrollToEnd({ animated: true });
    } else {
      setLoader(false);
    }
  }

  function genId() {
    let id = String(Math.floor(Math.random() * 100));
    for (let item of chat) {
      // console.log(item);

      if (item.id === id) {
        id = String(Math.floor(Math.random() * 100));
      }
    }
    return id;
  }

  function setterPicBtn() {
    setPicBtn(false);
  }

  const [loaded, font_error] = useFonts({
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
  });

  if (!loaded && !font_error) {
    return null;
  }

  const paddingBottom = useSharedValue(Platform.OS === "ios" ? 10 : 0);
  const animatePadding = () => {
    paddingBottom.value = withTiming(
      keyboard.keyboardShown
        ? keyboard.keyboardHeight / 3
        : Platform.OS === "ios"
        ? 10
        : 0,
      {
        duration: 150,
      }
    );
  };
  const animatedStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: paddingBottom.value,
    };
  });
  useEffect(() => {
    animatePadding();
  }, [keyboard.keyboardShown]);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* onPress={Keyboard.dismiss} */}
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
          }}
        >
          <Animated.View style={[styles.parentBox, animatedStyle]}>
            {!picBtn && (
              <>
                <View style={styles.infoBox}>
                  {chat.length <= 0 && (
                    <Text style={styles.welcomeText}>
                      Ask <Text style={styles.accentColor}>AI</Text> About{" "}
                      <Text style={styles.accentColor}>Medicine</Text>.
                    </Text>
                  )}
                  {chat.length > 0 && (
                    <FlatList
                      ref={flatListRef}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.messagesList}
                      data={chat}
                      keyboardShouldPersistTaps={"handled"}
                      renderItem={({ item, index }) => {
                        const isLast = index === chat.length - 1;
                        return (
                          <Animated.View
                            entering={isLast ? FadeIn : undefined}
                            style={[
                              item.source == "user"
                                ? styles.UserResponse
                                : styles.AIResponse,
                            ]}
                          >
                            {item.msg?.startsWith("Image Attached") ? (
                              <Image
                                source={Camera}
                                resizeMode="contain"
                                style={{
                                  width: 18,
                                  height: 18,
                                }}
                              />
                            ) : null}

                            <Markdown
                              style={{
                                body: {
                                  color: "#fff",
                                  fontSize: 12,
                                  fontFamily: "Poppins-Regular",
                                  width: "100%",
                                },
                                hr: {
                                  borderBottomColor: "#fff",
                                  borderBottomWidth: 1,
                                },
                                heading3: {
                                  color: "#fff",
                                  fontFamily: "Poppins-Bold",
                                },
                              }}
                            >
                              {item.msg}
                            </Markdown>
                            {/* <Text>{chat[chat.length - 1].id == item.id?"true":"False"}</Text> */}
                          </Animated.View>
                        );
                      }}
                      keyExtractor={(item) => item.id}
                      onContentSizeChange={() => {
                        flatListRef.current?.scrollToEnd({ animated: true });
                      }}
                      onLayout={() =>
                        flatListRef.current?.scrollToEnd({ animated: true })
                      }
                      refreshControl={
                        <RefreshControl
                          colors={["#8364db"]}
                          tintColor="#8364db"
                          title="Refreshing..."
                          refreshing={refreshing}
                          onRefresh={onRefresh}
                        />
                      }
                    />
                  )}
                </View>
                <View style={styles.queryBox}>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor={"black"}
                    placeholder="Ask Here"
                    keyboardType="default"
                    onChangeText={(text) => {
                      setText(text);
                    }}
                    value={text}
                    editable={!loader}
                  />
                  <Pressable
                    style={styles.button}
                    onPress={() => {
                      if (!loader && text != "") {
                        conversation(genId(), text, "text");
                      }
                    }}
                  >
                    {loader && <ActivityIndicator color={"#fff"} />}
                    {!loader && (
                      // <AntDesign
                      //   style={styles.buttonLogo}
                      //   name="arrowright"
                      //   size={22}
                      // />

                      <Image
                        source={Send}
                        resizeMode="contain"
                        style={{
                          width: 30,
                          height: 30,
                        }}
                      />
                    )}
                  </Pressable>
                </View>
              </>
            )}

            <View style={picBtn ? styles.queryBox2 : styles.queryBox}>
              <View style={styles.cameraButtonView}>
                <Pressable
                  disabled={loader}
                  style={styles.cameraButton}
                  onPress={() => {
                    setPicBtn(!picBtn);
                  }}
                >
                  <Text style={styles.buttonText}>
                    {!picBtn ? "Ask By Picture" : "Go Back"}
                  </Text>
                  {!picBtn ? (
                    <Image
                      source={Camera}
                      resizeMode="contain"
                      style={{
                        width: 24,
                        height: 24,
                      }}
                    />
                  ) : (
                    <AntDesign
                      style={styles.buttonLogo}
                      name={"back"}
                      size={22}
                    />
                  )}
                </Pressable>
              </View>

              {picBtn && (
                <CameraButton
                  conversation={conversation}
                  chat={chat}
                  setPicBtn={setterPicBtn}
                />
              )}
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      {/* <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      </SafeAreaView> */}
    </>
  );
}

const styles = StyleSheet.create({
  parentBox: {
    gap: 10,
    // height: "100%",
    flex: 1,
  },
  infoBox: {
    // height: "88%",
    flex: 1,
  },
  queryBox: {
    // height: "5%",
    height: 42,
    flexDirection: "row",
    gap: 5,
  },
  queryBox2: {
    height: "100%",
    flex: 1,
    // flexDirection: "row",
    gap: 5,
    marginTop: 5,
  },
  messagesList: {
    justifyContent: "flex-end",
    minHeight: "100%",
    gap: 10,
    flexGrow: 1,
    flexDirection: "column",
    // borderWidth:1
  },
  messageWrapperAI: {
    alignSelf: "flex-start",
  },
  messageWrapperUser: {
    alignSelf: "flex-end",
  },
  AIResponse: {
    alignItems: "flex-start",
    backgroundColor: "#8364db",
    paddingVertical: 2,
    paddingHorizontal: 25,
    borderRadius: 36,
    maxWidth: "80%",
    alignSelf: "flex-start",
    boxShadow: "0px 0px 20px 1px rgb(224, 224, 224)",
  },
  messageText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    width: "100%",
  },
  UserResponse: {
    alignItems: "center",
    backgroundColor: "#39c3d1",
    paddingVertical: 2,
    paddingHorizontal: 25,
    borderRadius: 36,
    alignSelf: "flex-end",
    maxWidth: "80%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 5,
    boxShadow: "0px 0px 20px 1px rgb(224, 224, 224)",
  },
  welcomeText: {
    fontFamily: "Poppins-Bold",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    margin: "auto",
  },
  accentColor: {
    color: "#8364db",
  },
  input: {
    height: "100%",
    minHeight: "100%",
    flexGrow: 1,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: "#8364db",
    padding: 5,
    paddingHorizontal: 10,
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "black",
  },
  button: {
    width: 60,
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#8364db",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  buttonText: {
    color: "#f1fbfc",
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    marginEnd: 10,
  },
  cameraButtonView: {
    width: "100%",
    maxHeight: 42,
    minHeight: 42,
  },
  cameraButton: {
    backgroundColor: "#8364db",
    borderRadius: 5,
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  buttonLogo: {
    color: "#f1fbfc",
  },
});
