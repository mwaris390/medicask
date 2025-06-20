import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";

export default function CameraButton({
  conversation,
  chat,
  setPicBtn
}: {
  conversation: (
    id: string,
    message: string,
    mode: "image" | "text"
  ) => Promise<void>;
  chat: {
    id: string;
    source: "user" | "ai";
    msg: string;
  }[];
  setPicBtn: () => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("back");

  function genId() {
    let id = String(Math.floor(Math.random() * 100));
    for (let item of chat) {
      if (item.id === id) {
        id = String(Math.floor(Math.random() * 100));
      }
    }
    return id;
  }

  const takePicture = async () => {
    Toast.show({
      type: "info",
      text1: "Please Wait!",
      text2: "The picture is processing.",
      position:'bottom'
    });
    const photo = await ref.current?.takePictureAsync();
    if (photo?.uri) {
      setUri(photo?.uri);
      let uri = photo?.uri;
      if (!photo.uri.startsWith('data:image/png;base64')) {
        try {
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          uri = `data:image/jpeg;base64,${base64}`;
        } catch (error) {
          console.error("Failed to convert image to Base64:", error);
          Toast.show({
            type: "error",
            text1: "Sorry!",
            text2: "Something went wrong while capturing picture",
            position:'bottom'
          });
        }
      }
      conversation(genId(), uri, "image");
      setPicBtn()
    }
  };

  useEffect(() => {
    if (permission === null) return;
    if (!permission.granted) {
      // console.log("Permission not granted. Requesting...");
      requestPermission();
    } else {
      // console.log(permission);
      // console.log("Permission granted!");
    }
  }, [permission]);

  const renderCamera = () => {
    return (
      <CameraView
        style={styles.camera}
        ref={ref}
        mode={mode}
        facing={facing}
        mute={false}
        responsiveOrientationWhenOrientationLocked
      >
        <View style={styles.shutterContainer}>
          {/* <Pressable onPress={toggleMode}>
            {mode === "picture" ? (
              <AntDesign name="picture" size={32} color="white" />
            ) : (
              <Feather name="video" size={32} color="white" />
            )}
          </Pressable> */}
          <Pressable
            onPress={async () => {
              await takePicture();
            }}
          >
            {({ pressed }) => (
              <View
                style={[
                  styles.shutterBtn,
                  {
                    opacity: pressed ? 0.5 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.shutterBtnInner,
                    {
                      backgroundColor: mode === "picture" ? "white" : "red",
                    },
                  ]}
                />
              </View>
            )}
          </Pressable>
          {/* <Pressable onPress={toggleFacing}>
            <FontAwesome6 name="rotate-left" size={32} color="white" />
          </Pressable> */}
        </View>
      </CameraView>
    );
  };

  return <View style={styles.container}>{renderCamera()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  shutterContainer: {
    width: "100%",
    height: "95%",
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
});
