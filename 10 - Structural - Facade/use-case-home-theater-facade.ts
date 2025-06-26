import { exit } from 'process';

// 1. Subsystem classes
class Amplifier {
  on() { console.log('🎚️ Amplifier on'); }
  off() { console.log('🎚️ Amplifier off'); }
  setVolume(level: number) { console.log(`🔊 Volume set to ${level}`); }
}
class Projector {
  on() { console.log('📽️ Projector on'); }
  off() { console.log('📽️ Projector off'); }
}
class Lights {
  dim(percent: number) { console.log(`💡 Lights dimmed to ${percent}%`); }
  on() { console.log('💡 Lights on'); }
}
class Screen {
  down() { console.log('🖥️ Screen down'); }
  up() { console.log('🖥️ Screen up'); }
}
class StreamingPlayer {
  on() { console.log('▶️ StreamingPlayer on'); }
  off() { console.log('⏹️ StreamingPlayer off'); }
  play(movie: string) { console.log(`🎬 Playing "${movie}"`); }
}

// 2. Facade
class HomeTheaterFacade {
  constructor(private amp: Amplifier, private proj: Projector, private lights: Lights, private screen: Screen, private player: StreamingPlayer) {}
  watchMovie(movie: string) {
    console.log('\n🍿 Get ready to watch a movie...');
    this.lights.dim(10);
    this.screen.down();
    this.proj.on();
    this.amp.on();
    this.amp.setVolume(5);
    this.player.on();
    this.player.play(movie);
  }
  endMovie() {
    console.log('\n😴 Shutting movie theater down...');
    this.player.off();
    this.amp.off();
    this.proj.off();
    this.screen.up();
    this.lights.on();
  }
}

// 3. Demo
const facade = new HomeTheaterFacade(new Amplifier(), new Projector(), new Lights(), new Screen(), new StreamingPlayer());
facade.watchMovie('Interstellar');
facade.endMovie();
exit(0); 