import { Controls, Player } from '@lottiefiles/react-lottie-player';

const LoadingAnimation = () => {

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="md:w-1/3 md:h-1/3">
                <Player
                    autoplay
                    loop
                    src="https://lottie.host/af13d90b-5d63-48f7-bb4c-6f18cdc43180/hPh5Mue6aj.json"
                    style={{ height: '300px', width: '300px' }}
                >
                    <Controls visible={false} buttons={['play', 'repeat', 'frame', 'debug']} />
                </Player>
            </div>
        </div>
    )
}

export default LoadingAnimation;